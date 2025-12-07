<template>
  <div class="place-detail-container">
    <!-- Header -->
    <div class="header">
      <button class="icon-btn back-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h2 class="header-title">상세보기</h2>
      <div class="header-spacer"></div>
    </div>

    <!-- Bottom Content Wrapper -->
    <div class="bottom-content-wrapper">
      <!-- Image Carousel -->
      <div class="image-carousel">
        <div class="carousel-track" @scroll="onScroll">
          <div v-for="(img, index) in place.images" :key="index" class="carousel-item">
            <img :src="img" alt="Place Image" class="place-image" />
          </div>
        </div>
        <!-- Dots indicator -->
        <div v-if="place.images && place.images.length > 1" class="carousel-dots">
          <div 
            v-for="(img, index) in place.images" 
            :key="index" 
            class="dot" 
            :class="{ active: currentImageIndex === index }"
          ></div>
        </div>
      </div>

      <!-- Content Card -->
      <div class="content-card">
        <h1 class="place-title">{{ place.name }}</h1>
        <p class="place-description">{{ place.description }}</p>
        
        <div class="tags">
          <span v-for="tag in place.tags" :key="tag" class="tag">#{{ tag }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="primary-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          이 장소로 향하기
        </button>
        <button class="secondary-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          AI에게 다음 계획 요청하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from '@/components/common/Navbar.vue';

const route = useRoute();
const place = ref({
  id: 1,
  name: '영도 해녀촌',
  description: '신선한 해산물을 맛볼 수 있는 곳. 바다 바로 앞에서 낭만적인 식사를 즐겨보세요.',
  images: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566371486490-560ded23b5e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  tags: ['오션뷰', '감성맛집', '즉흥여행']
});

const currentImageIndex = ref(0);

const onScroll = (e) => {
  const scrollLeft = e.target.scrollLeft;
  const width = e.target.clientWidth;
  currentImageIndex.value = Math.round(scrollLeft / width);
};

// In a real app, fetch place details using route.params.id
onMounted(() => {
  console.log('Place ID:', route.params.id);
  // Fetch logic here
});
</script>

<style scoped>
.place-detail-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.image-carousel {
  width: 100%;
  position: relative;
  padding: 0 20px 20px;
  box-sizing: border-box;
}

.carousel-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  border-radius: 20px;
}

.carousel-track::-webkit-scrollbar {
  display: none;
}

.carousel-item {
  flex: 0 0 100%;
  width: 100%;
  height: 45vh; /* Fixed height for the carousel */
  scroll-snap-align: start;
  overflow: hidden;
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.place-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-dots {
  position: absolute;
  bottom: 32px; /* Adjust based on padding */
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
  z-index: 5;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  transition: background 0.2s;
}

.dot.active {
  background: white;
}

.header {
  position: relative;
  z-index: 50; /* Ensure header is above bottom content */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: white; /* Ensure header has background */
  box-shadow: 0 2px 10px rgba(0,0,0,0.05); /* Optional: add shadow for separation */
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.header-spacer {
  width: 40px; /* Same width as back button for centering */
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

/* Container for content and buttons at the bottom */
.bottom-content-wrapper {
  flex: 1; /* Fill remaining space below header */
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Allow scrolling if content overflows */
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}

.content-card {
  margin: 0 20px 20px;
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.place-title {
  font-size: 24px;
  font-weight: 800;
  color: #333;
  margin: 0 0 12px;
}

.place-description {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: #f0f7ff;
  color: #0095f6; /* Primary Blue */
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

/* Specific tag colors from image */
.tag:nth-child(1) { background: #e8f5e9; color: #2e7d32; } /* Greenish */
.tag:nth-child(2) { background: #ffebee; color: #c62828; } /* Reddish */
.tag:nth-child(3) { background: #fff8e1; color: #f9a825; } /* Yellowish */

.action-buttons {
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.primary-btn {
  width: 100%;
  padding: 16px;
  background: #2196F3; /* Blue */
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.secondary-btn {
  width: 100%;
  padding: 16px;
  background: white;
  color: #333;
  border: 1px solid #eee;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.bottom-nav-spacer {
  display: none; /* Handled by padding-bottom in wrapper */
}
</style>
