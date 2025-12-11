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
    <PlaceDetailContent 
      v-if="place" 
      :place="place" 
      :visible="true" 
    />
    <div v-else class="loading-state">
      <p>정보를 불러오는 중입니다...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import PlaceDetailContent from '@/components/attraction/PlaceDetailContent.vue';
import { attractionApi } from '@/api/attraction';

const route = useRoute();
const place = ref(null);

// In a real app, fetch place details using route.params.id
onMounted(() => {
  console.log('Place ID:', route.params.id);
  // Fetch logic here
  attractionApi.getAttractionById(route.params.id).then((response) => {
    // Map API response to component props
    const placeData = {
      ...response,
      name: response.title,
      description: response.overview,
      images: [response.firstImage1, response.firstImage2].filter(img => img),
      tags: response.tagNames || [],
      reviewCnt: response.reviewCnt
    };
    place.value = placeData;
  }).catch(err => {
    console.error("Failed to fetch place details:", err);
  });
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

.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
}
</style>
