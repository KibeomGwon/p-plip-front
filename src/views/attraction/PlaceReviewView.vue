<template>
  <div class="review-page">
    <AppHeader title="리뷰" />

    <main class="content" @scroll="handleScroll">
      <div class="place-summary">
        <h2 class="place-name">{{ placeName }}</h2>
        <span class="review-count">리뷰 {{ reviews.length }}개</span>
        
        <div class="filter-wrapper">
          <SortFilter v-model="currentSort" :options="sortOptions" />
        </div>
      </div>

      <div class="review-list">
        <div v-if="!isLoading && reviews.length === 0" class="empty-state">
          <p>아직 리뷰가 없습니다.</p>
        </div>
        <PlaceReviewItem 
          v-for="review in reviews" 
          :key="review.id" 
          :review="review" 
          @delete="handleReviewDelete"
          @edit="handleReviewEdit"
        />
      </div>
    </main>

    <PlaceReviewInput @submit="addReview" />
    
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
import { useRoute } from 'vue-router';
import AppHeader from '@/components/common/AppHeader.vue';
import SortFilter from '@/components/common/SortFilter.vue';
import PlaceReviewItem from '@/components/attraction/review/PlaceReviewItem.vue';
import PlaceReviewInput from '@/components/attraction/review/PlaceReviewInput.vue';
import PlaceReviewModifyModal from '@/components/attraction/review/PlaceReviewModifyModal.vue';
import { reviewApi } from '@/axios/review';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const placeName = ref(route.query.name || '장소 정보 없음'); 

// Sorting
const currentSort = ref('DESC');
const sortOptions = [
  { label: '최신순', value: 'DESC' },
  { label: '오래된순', value: 'ASC' }
];

// Mock Data
const reviews = ref([]);

// Pagination
const pageInfo = ref({
  pageNo: 1,
  pageSize: 5,
  next: false,
  totalCount: 0
});
const isLoading = ref(false);

// Modify Modal State
const showModifyModal = ref(false);
const modifyingReview = ref(null);

const addReview = (payload) => {
  if (!useAuthStore().isLoggedIn) {
    alert('로그인 후 리뷰를 작성할 수 있습니다.');
    return;
  }
  const { text, images } = payload;
  
  reviewApi.postReview(route.params.id, { content: text, fileIds: images })
    .then(() => {
      // Reset list and fetch page 1
      pageInfo.value.pageNo = 1;
      reviews.value = [];
      fetchReviews();
    })
    .catch(err => {
      console.error(err);
      alert('리뷰 작성에 실패했습니다.');
    });
};

const fetchReviews = () => {
    if (isLoading.value) return;
    isLoading.value = true;

    // Updated API call signature: (id, pageNo, pageSize, sort)
    reviewApi.getReviewList(
      route.params.id, 
      pageInfo.value.pageNo, 
      pageInfo.value.pageSize,
      currentSort.value
    )
      .then((res) => {
        const newReviews = res.list.map(item => {
          console.log('Review Item:', item); // Debug log
          const dateDate = new Date(item.createdAt);
          return {
            ...item,
            author: item.username,
            name: item.username, // Add name just in case, though author is used for display
            isOwner: item.author, // Preserve ownership boolean
            text: item.content,
            photos: item.reviewImages || [],
            avatarUrl: item.userProfileImage,
            date: `${dateDate.getFullYear()}.${String(dateDate.getMonth() + 1).padStart(2, '0')}.${String(dateDate.getDate()).padStart(2, '0')}`,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt ? new Date(item.updatedAt) : null,
            avatarColor: getRandomColor()
          }
        });

        if (pageInfo.value.pageNo === 1) {
          reviews.value = newReviews;
        } else {
          reviews.value = [...reviews.value, ...newReviews];
        }

        pageInfo.value.next = res.next;
        pageInfo.value.totalCount = res.totalCount;
        console.log(reviews.value);
        console.log(pageInfo.value);
      })
      .finally(() => {
        isLoading.value = false;
      });
}

// Watch for sort changes
watch(currentSort, () => {
  pageInfo.value.pageNo = 1;
  reviews.value = [];
  fetchReviews();
});

const handleReviewDelete = (reviewId) => {
  // Remove from list or refetch
  // Refetching is safer to keep pagination correct, but removing from list is smoother.
  // Given pagination, removing from list might leave a "short" page.
  // Let's refetch to be safe.
  pageInfo.value.pageNo = 1;
  reviews.value = [];
  fetchReviews();
};

const handleReviewEdit = (review) => {
  modifyingReview.value = review;
  showModifyModal.value = true;
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

const getRandomColor = () => {
  const colors = ['#EFEBE9', '#F5F5F5', '#FFF3E0', '#E3F2FD', '#F3E5F5'];
  return colors[Math.floor(Math.random() * colors.length)];
}

const handleScroll = (e) => {
  const { scrollTop, clientHeight, scrollHeight } = e.target;
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    if (pageInfo.value.next && !isLoading.value) {
      pageInfo.value.pageNo++;
      fetchReviews();
    }
  }
};

onMounted(() => {
  console.log('Place ID:', route.params.id);
  fetchReviews();
});
</script>

<style scoped>
.review-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Pretendard', sans-serif;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px; 
}

.place-summary {
  padding: 24px 20px;
  text-align: center;
  background: white;
  margin-bottom: 2px;
}

.place-name {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 8px;
  color: #333;
}

.review-count {
  color: #666;
  font-size: 14px;
}

.filter-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.review-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 200px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #888;
  font-size: 15px;
}
</style>
