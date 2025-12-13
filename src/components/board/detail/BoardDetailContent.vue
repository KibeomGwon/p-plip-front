<template>
  <div class="board-detail-content">
    <!-- Image Carousel -->
    <div class="image-carousel">
      <div class="carousel-track" @scroll="onScroll" @wheel="onWheel">
        <div v-for="(img, index) in postImages" :key="index" class="carousel-item">
          <img :src="getImageUrl(img)" alt="Post Image" class="post-image" />
        </div>
      </div>
      <!-- Dots indicator if multiple images -->
      <div v-if="postImages && postImages.length > 1" class="carousel-dots">
        <div 
          v-for="(image, index) in postImages" 
          :key="image.id" 
          class="dot" 
          :class="{ active: index === currentImageIndex }"
        ></div>
      </div>
    </div>

    <!-- Post Title -->
    <div class="post-title-section">
      <h3 class="detail-post-title">{{ post.title }}</h3>
    </div>

    <!-- User Info -->
    <div class="user-info-bar">
      <div class="author-avatar" :style="{ backgroundColor: post.avatarColor || '#ccc' }">
        <img :src="post.avatarImage || defaultAvatar" alt="Author" class="avatar-img">
      </div>
      <span class="author-name">{{ post.authorName }}</span>

      <!-- Like Button -->
      <div class="like-wrapper" @click="toggleLike" v-if="showLike">
        <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            class="like-icon"
            :class="{ 'liked': isLiked }"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
            :stroke="isLiked ? '#FF6B6B' : '#888'" 
            :fill="isLiked ? '#FF6B6B' : 'none'"
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          />
        </svg>
        <span class="like-count" :class="{ 'liked-text': isLiked }">{{ likeCount }}</span>
      </div>
    </div>

    <!-- Content -->
    <div class="post-text-content">
      <p class="post-body">{{ post.content }}</p>
      <p class="post-date" @click="toggleDateDisplay" style="cursor: pointer;">
        {{ getDisplayDate(post.createdAt || post.date) }} · 조회 {{ post.viewCnt || 0 }}
      </p>
      <p v-if="post.updatedAt && post.updatedAt !== post.createdAt" class="post-date">{{ formatTime(post.updatedAt) }} 수정됨</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRelativeTime } from '@/composables/useRelativeTime';
import defaultAvatar from '@/assets/default_avatar.png';
import { useImage, useImages } from '@/composables/useImage';
import { useAuthStore } from '@/stores/auth';
import { boardApi } from '@/api/board';
import { useRouter } from 'vue-router';

const { formatTime } = useRelativeTime();
const { getImageUrl } = useImage();
const authStore = useAuthStore();
const router = useRouter();

const props = defineProps({
  post: {
    type: Object,
    required: true,
    default: () => ({
      title: '',
      authorName: '',
      avatarImage: null,
      content: '',
      createdAt: '',
      updatedAt: '',
      freeBoardImages: [],
      noticeImages: [],
      likeCnt: 0
    })
  },
  showLike: {
    type: Boolean,
    default: true
  },
  isLiked: {
    type: Boolean,
    default: false
  },
  likeCount: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['toggle-like']);

const postImages = computed(() => {
  if (props.post.freeBoardImages && props.post.freeBoardImages.length > 0) {
    return props.post.freeBoardImages;
  }
  if (props.post.noticeImages && props.post.noticeImages.length > 0) {
    return props.post.noticeImages;
  }
  return [];
});

const isLiked = ref(props.isLiked);
const likeCount = ref(0);

// Watch for post changes to initialize likeCount
watch(() => props.post, (newPost) => {
    if (newPost) {
        likeCount.value = newPost.likeCnt || 0;
    }
}, { immediate: true });

// Watch for isLiked prop changes (from parent fetching)
watch(() => props.isLiked, (newVal) => {
    isLiked.value = newVal;
});

const toggleLike = async () => {
    if (!authStore.isLoggedIn) {
        if (confirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?")) {
             router.push(`/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`);
        }
        return;
    }

    try {
        if (isLiked.value) {
            await boardApi.unlikeFreeBoard(props.post.id);
            isLiked.value = false;
            likeCount.value--;
        } else {
            await boardApi.likeFreeBoard(props.post.id);
            isLiked.value = true;
            likeCount.value++;
        }
    } catch (error) {
        console.error("Like toggle failed:", error);
        alert(error.message || "좋아요 처리에 실패했습니다.");
    }
};


const currentImageIndex = ref(0);
let isScrolling = false;
const showExactDate = ref(false);

const toggleDateDisplay = () => {
  showExactDate.value = !showExactDate.value;
};

const getDisplayDate = (date) => {
  if (!date) return '';
  if (showExactDate.value) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return formatTime(date);
};

const onScroll = (e) => {
  const scrollLeft = e.target.scrollLeft;
  const width = e.target.clientWidth;
  currentImageIndex.value = Math.round(scrollLeft / width);
};

const onWheel = (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (isScrolling) return;
  if (Math.abs(e.deltaY) < 10) return; // threshold

  const container = e.currentTarget;
  const width = container.clientWidth;
  const maxIndex = (postImages.value || []).length - 1;

  if (e.deltaY > 0 && currentImageIndex.value < maxIndex) {
    // Next
    isScrolling = true;
    container.scrollTo({ left: (currentImageIndex.value + 1) * width, behavior: 'smooth' });
    setTimeout(() => isScrolling = false, 500);
  } else if (e.deltaY < 0 && currentImageIndex.value > 0) {
    // Prev
    isScrolling = true;
    container.scrollTo({ left: (currentImageIndex.value - 1) * width, behavior: 'smooth' });
    setTimeout(() => isScrolling = false, 500);
  }
};
</script>

<style scoped>
.board-detail-content {
  display: flex;
  flex-direction: column;
  padding-top: 15px; /* Add space between header separator and content */
}

.image-carousel {
  width: 100%;
  position: relative;
  padding: 0 16px;
  box-sizing: border-box;
}

.carousel-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  touch-action: pan-x;
}

.carousel-track::-webkit-scrollbar {
  display: none;
}

.carousel-item {
  flex: 0 0 100%;
  width: 100%;
  aspect-ratio: 1;
  scroll-snap-align: start;
  border-radius: 24px;
  overflow: hidden;
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-dots {
  position: absolute;
  bottom: 12px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  border: 1px solid rgba(0, 0, 0, 0.3);
}

.dot.active {
  background: white;
}

.post-title-section {
  padding: 12px 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-post-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
  line-height: 1.3;
  flex: 1;
  margin-right: 8px;
  text-align: left;
}

.user-info-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px 8px;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-right: 10px;
  font-size: 12px;
  font-weight: bold;
  color: #555;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.post-text-content {
  padding: 0 16px;
  margin-bottom: 12px;
}

.post-body {
  font-size: 14px;
  color: #333;
  margin: 0 0 8px;
  line-height: 1.5;
}

.post-date {
  font-size: 10px;
  color: #999;
  margin: 0;
  text-transform: uppercase;
}

.like-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
  margin-left: 12px; /* Gap from name */
}

.like-icon {
  transition: transform 0.2s, fill 0.2s;
}

.like-icon.liked {
  transform: scale(1.1);
}

.like-count {
  font-size: 10px;
  color: #888;
  margin-top: 2px;
  font-weight: 500;
}

.like-count.liked-text {
  color: #FF6B6B;
}

</style>
