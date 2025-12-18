<template>
  <div class="my-review-list-container">
    <!-- Header -->
    <div class="header">
      <button class="icon-btn back-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h2 class="header-title">내 리뷰</h2>
      <SortFilter v-model="sortOrder" :options="sortOptions" />
    </div>

    <!-- Review List -->
    <div class="review-list-wrapper" @scroll="handleScroll">
      <div v-if="reviews.length > 0" class="review-list">
        <!-- Card List Items (Matches FreeBoardListItem) -->
        <div 
          v-for="review in reviews" 
          :key="review.id" 
          class="review-card"
          @click="openDetailModal(review)"
        >
            <div class="card-image" :style="{ backgroundImage: `url(${getReviewThumbnail(review)})` }"></div>
            
            <div class="card-content">
                <h3 class="place-name">{{ review.attractionName || '장소 정보 없음' }}</h3>
                <p class="review-username">{{ review.username }}</p>
                <div class="review-meta">
                    <span class="review-date">{{ formatTime(review.createdAt) }}</span>
                    <span v-if="review.updatedAt" class="edit-badge">수정됨</span>
                </div>
            </div>
        </div>
      </div>
      <div v-else-if="!isLoading" class="empty-state">
        <p>작성한 리뷰가 없습니다.</p>
      </div>
      
      <div v-if="isLoading" class="loading-spinner">
        <div class="spinner"></div>
      </div>
    </div>

    <!-- Review Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedReview" class="modal-overlay" @click.self="closeDetailModal">
        <div class="modal-content review-detail-modal">
          <header class="modal-header">
            <h3>리뷰 상세</h3>
            <button class="close-btn" @click="closeDetailModal">×</button>
          </header>
          <div class="modal-body">
             <div class="detail-place-name">
                <span class="place-icon">📍</span> {{ selectedReview.attractionName }}
             </div>
             <PlaceReviewItem 
                :review="selectedReview" 
                @delete="handleDelete"
                @edit="handleEdit"
             />
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Modify Modal -->
    <PlaceReviewModifyModal 
      v-if="modifyingReview"
      :show="showModifyModal"
      :review="modifyingReview"
      @close="closeModifyModal"
      @submit="handleUpdateReview"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import SortFilter from '@/components/common/SortFilter.vue';
import PlaceReviewItem from '@/components/attraction/review/PlaceReviewItem.vue';
import PlaceReviewModifyModal from '@/components/attraction/review/PlaceReviewModifyModal.vue';
import { reviewApi } from '@/axios/review';
import { useAuthStore } from '@/stores/auth';
import { useRelativeTime } from '@/composables/useRelativeTime';
import { useImage } from '@/composables/useImage';

const { formatTime } = useRelativeTime();
const { getImageUrl } = useImage();

const sortOrder = ref('DESC');
const sortOptions = [
  { label: '최신순', value: 'DESC' },
  { label: '오래된순', value: 'ASC' }
];

const reviews = ref([]);
const pageInfo = ref({
  pageNo: 1,
  pageSize: 10,
  next: false
});
const isLoading = ref(false);

// Detail Modal State
const selectedReview = ref(null);

// Modify State
const showModifyModal = ref(false);
const modifyingReview = ref(null);

const fetchReviews = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  
  try {
    const res = await reviewApi.getMyReviewList(pageInfo.value.pageNo, pageInfo.value.pageSize, sortOrder.value);
    
    const newReviews = res.list.map(item => {
      const dateDate = new Date(item.createdAt);
      return {
        ...item,
        author: item.username || '나', 
        name: item.username,
        isOwner: true, 
        text: item.content,
        photos: item.reviewImages || [],
        avatarUrl: item.userProfileImage, 
        date: `${dateDate.getFullYear()}.${String(dateDate.getMonth() + 1).padStart(2, '0')}.${String(dateDate.getDate()).padStart(2, '0')}`,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : null,
        attractionName: item.attractionName
      }
    });

    if (pageInfo.value.pageNo === 1) {
      reviews.value = newReviews;
    } else {
      reviews.value = [...reviews.value, ...newReviews];
    }
    
    pageInfo.value.next = res.next;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchReviews();
  console.log(reviews.value);
});

watch(sortOrder, () => {
    pageInfo.value.pageNo = 1;
    reviews.value = [];
    fetchReviews();
});

const handleScroll = (e) => {
  const { scrollTop, clientHeight, scrollHeight } = e.target;
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    if (pageInfo.value.next && !isLoading.value) {
      pageInfo.value.pageNo++;
      fetchReviews();
    }
  }
};

const getReviewThumbnail = (review) => {
    if (review.photos && review.photos.length > 0) {
        const photo = review.photos[0];
        // photos objects often have 'name' or full 'path' depending on API.
        // Review API normally returns reviewImages with 'name'.
        // getImageUrl handles appending base URL if needed.
        console.log(photo);
        return getImageUrl(photo.path);
    }
    // Fallback? Maybe a placeholder or empty
    return 'https://via.placeholder.com/120?text=No+Image';
};

const openDetailModal = (review) => {
    selectedReview.value = review;
};

const closeDetailModal = () => {
    selectedReview.value = null;
};

const handleDelete = async (reviewId) => {
    closeDetailModal();
    pageInfo.value.pageNo = 1;
    reviews.value = [];
    fetchReviews();
};

const handleEdit = (review) => {
    modifyingReview.value = review;
    showModifyModal.value = true;
    closeDetailModal(); 
};

const closeModifyModal = () => {
    showModifyModal.value = false;
    modifyingReview.value = null;
};

const handleUpdateReview = async (payload) => {
  try {
    await reviewApi.updateReview(payload.id, {
      content: payload.content,
      files: payload.files
    });
    alert('리뷰가 수정되었습니다.');
    closeModifyModal();
    
    // Refresh list
    pageInfo.value.pageNo = 1;
    reviews.value = [];
    fetchReviews();
  } catch (err) {
    console.error(err);
    alert('리뷰 수정에 실패했습니다.');
  }
};
</script>

<style scoped>
.my-review-list-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f9f9f9;
  touch-action: none;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #eee;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.review-list-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Card Style (Matching FreeBoardListItem) */
.review-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: row;
    height: 120px;
    cursor: pointer;
    transition: transform 0.2s;
}

.review-card:active {
    transform: scale(0.98);
}

.card-image {
    width: 120px;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-color: #eee;
    flex-shrink: 0;
}

.card-content {
    padding: 12px 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
}

.place-name {
    font-size: 16px;
    font-weight: 700;
    color: #333;
    margin: 0 0 4px;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.review-username {
    font-size: 13px;
    color: #666;
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
}

.review-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #888;
    margin-top: auto;
}

.edit-badge {
    font-size: 11px;
    color: #999;
}


/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 16px;
  overflow-y: auto;
}

.detail-place-name {
    font-weight: 700;
    font-size: 16px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    color: #333;
    display: flex;
    align-items: center;
    gap: 6px;
}

.empty-state {
    text-align: center;
    padding: 40px;
    color: #999;
}

.loading-spinner {
    display: flex;
    justify-content: center;
    padding: 20px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
