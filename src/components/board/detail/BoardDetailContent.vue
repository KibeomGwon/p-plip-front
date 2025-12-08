<template>
  <div class="board-detail-content">
    <!-- Image Carousel -->
    <div class="image-carousel">
      <div class="carousel-track" @scroll="onScroll" @wheel="onWheel">
        <div v-for="(img, index) in post.images" :key="index" class="carousel-item">
          <img :src="img" alt="Post Image" class="post-image" />
        </div>
      </div>
      <!-- Dots indicator if multiple images -->
      <div v-if="post.images && post.images.length > 1" class="carousel-dots">
        <div v-for="(img, index) in post.images" :key="index" class="dot" :class="{ active: index === 0 }"></div>
      </div>
    </div>

    <!-- Post Title -->
    <div class="post-title-section">
      <h3 class="detail-post-title">{{ post.title }}</h3>
    </div>

    <!-- User Info -->
    <div class="user-info-bar">
      <div class="author-avatar" :style="{ backgroundColor: post.avatarColor || '#ccc' }">
        <img v-if="post.avatarImage" :src="post.avatarImage" alt="Author" class="avatar-img">
        <span v-else class="avatar-initial">{{ post.author ? post.author[0] : '?' }}</span>
      </div>
      <span class="author-name">{{ post.author }}</span>
    </div>

    <!-- Content -->
    <div class="post-text-content">
      <p class="post-body">{{ post.content }}</p>
      <p class="post-date">{{ formatTime(post.date) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRelativeTime } from '@/composables/useRelativeTime';

const { formatTime } = useRelativeTime();

defineProps({
  post: {
    type: Object,
    required: true,
    default: () => ({
      title: '',
      author: '',
      avatarColor: '',
      avatarImage: null,
      content: '',
      date: '',
      images: []
    })
  }
});

const currentImageIndex = ref(0);

const onScroll = (e) => {
  const scrollLeft = e.target.scrollLeft;
  const width = e.target.clientWidth;
  currentImageIndex.value = Math.round(scrollLeft / width);
};

const onWheel = (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.scrollLeft += e.deltaY;
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
</style>
