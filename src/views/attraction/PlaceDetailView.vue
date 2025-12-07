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
    <PlaceDetailContent :place="place" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import PlaceDetailContent from '@/components/attraction/PlaceDetailContent.vue';

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
  touch-action: none; /* Prevent whole page drag */
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
</style>
