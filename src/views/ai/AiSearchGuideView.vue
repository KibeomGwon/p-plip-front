<template>
  <div class="guide-container">
    <!-- Header -->
    <header class="header">
      <button class="back-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="page-title">AI 검색 가이드</h1>
      <div class="header-right">
      </div>
    </header>

    <!-- Content -->
    <div class="content-scroll">
      
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-icon-wrapper">
          <div class="sparkle-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="#3B82F6"/>
            </svg>
          </div>
        </div>
        <h2 class="hero-title">똑똑한 AI 검색 시작하기</h2>
        <p class="hero-subtitle">원하는 장소를 더 쉽고 정확하게 찾아보세요.</p>
      </section>

      <!-- Steps List -->
      <div class="steps-list">
        
        <!-- Step 1 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-number">1</div>
            <h3 class="step-title">AI 버튼 터치</h3>
          </div>
          <p class="step-desc">
            지도 화면 오른쪽 하단에 있는 <span class="highlight-blue">파란색 AI 버튼</span>을 눌러보세요.
          </p>
          <div class="step-image-area step-1-bg">
             <img :src="aiSearchButtonImg" alt="AI Search Button" class="step-img-s1" />
          </div>
        </div>

        <!-- Step 2 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-number">2</div>
            <h3 class="step-title">검색어 입력</h3>
          </div>
          <p class="step-desc">
            "강남역 근처 분위기 좋은 카페" 처럼 자연스럽게 물어보세요.
          </p>
          <div class="step-image-area step-2-bg">
              <img :src="aiSearchBarImg" alt="AI Search Bar" class="step-img-s2" />
          </div>
        </div>

        <!-- Step 3 -->
        <div class="step-card">
          <div class="step-header">
            <div class="step-number">3</div>
            <h3 class="step-title">맞춤 설정</h3>
          </div>
          <p class="step-desc">
            반경, 추천 개수, 카테고리를 설정하여 딱 맞는 결과를 확인하세요.
          </p>
          <div class="step-image-area step-3-bg">
              <img :src="aiFilterDetailImg" alt="AI Filter Detail" class="step-img-s3" />
          </div>
        </div>

      </div>
      <footer class="footer" v-if="showStartButton">
        <button class="start-btn" @click="handleStart">
          지금 시작하기
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 5L19 12L12 19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import aiSearchButtonImg from '@/assets/ai/ai-search-button.png';
import aiSearchBarImg from '@/assets/ai/ai-search-bar.png';
import aiFilterDetailImg from '@/assets/ai/ai-filter-detail.png';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();

const showStartButton = computed(() => route.query.hideStart !== 'true');

const handleStart = () => {
    // Show confirmation dialog
    if (confirm("다음부터 보지 않으시겠습니까?")) {
        // User clicked "Yes" (OK) -> Hide guide next time
        localStorage.setItem('hideAiGuide', 'true');
    }
    // Proceed to Map View
    router.push({ name: 'attraction-map' });
};
</script>

<style scoped>
.guide-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #F8F9FA;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background-color: #F8F9FA;
}

.back-btn, .header-right {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
}



.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 0 20px; /* Reduced bottom padding since footer has it */
  /* Hide Scrollbar */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.content-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.hero-section {
  text-align: center;
  margin: 20px 0 40px 0;
}

.hero-icon-wrapper {
  width: 60px;
  height: 60px;
  background: #E8F0FE;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px auto;
}

.sparkle-icon svg {
    fill: #3B82F6;
}

.hero-title {
  font-size: 24px;
  font-weight: 800;
  color: #212529;
  margin-bottom: 8px;
}

.hero-subtitle {
  font-size: 15px;
  color: #6C757D;
  margin: 0;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-card {
  background: white;
  border-radius: 24px;
  padding: 24px 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.step-number {
  width: 28px;
  height: 28px;
  background-color: #3B82F6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.step-title {
  font-size: 18px;
  font-weight: 700;
  color: #212529;
  margin: 0;
}

.step-desc {
  font-size: 15px;
  color: #495057;
  line-height: 1.5;
  margin: 0 0 20px 0;
}

.highlight-blue {
  color: #3B82F6;
  font-weight: 600;
}

.step-image-area {
  width: 100%;
  height: auto; /* Remove fixed height constraint */
  min-height: 160px; /* Optional: maintain at least this height */
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  padding: 20px 0; /* Add visual breathing room */
}

/* Step 1 Visuals */
.step-1-bg {
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Reduce height specifically for step 1 */
    height: 120px !important; 
    min-height: 0 !important;
    padding: 10px 0 !important;
}
.step-img-s1 {
    max-width: 100%;
    /* max-height removed to allow growth */
    width: auto; 
    height: auto;
    object-fit: contain;
}

/* Step 2 Visuals */
.step-2-bg {
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0; /* Remove padding to allow full width centering */
}
.step-img-s2 {
    max-width: 100%;
    /* max-height removed */
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 30px; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* Step 3 Visuals */
.step-3-bg {
     background: transparent;
     display: flex;
     align-items: center;
     justify-content: center;
}
.step-img-s3 {
    max-width: 100%;
    /* max-height removed */
    width: auto;
    height: auto;
    object-fit: contain;
}



.footer {
  /* Removed fixed positioning */
  margin-top: 40px;
  padding: 0 0 40px 0; /* Add bottom padding for scroll */
  display: flex;
  justify-content: center;
}

.start-btn {
  width: 100%;
  max-width: 480px; /* Max width for tablets/desktop */
  height: 56px;
  background-color: #3B82F6;
  color: white;
  border: none;
  border-radius: 28px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: transform 0.2s;
}

.start-btn:active {
    transform: scale(0.98);
}
</style>
