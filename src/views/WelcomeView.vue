<template>
  <div class="welcome-container" @touchstart="onTouchStart" @touchend="onTouchEnd">

    <div class="slider" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
      <!-- Slide 1: Intro -->
      <div class="slide bg-0">
        <div class="glass-card">
          <div class="icon-circle">✈️</div>
          <h1>여행의 시작,<br><span class="brand-text">P-PLIP</span></h1>
          <p>어디로 떠날지 고민이신가요?<br>당신을 위한 완벽한 여행 계획을</p>
        </div>
      </div>

      <!-- Slide 2: AI Recommendation -->
      <div class="slide bg-1">
        <div class="glass-card">
          <div class="icon-circle">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h1>AI 맞춤 추천</h1>
          <p>복잡한 검색은 이제 그만.<br>AI가 당신의 취향을 분석하여<br>딱 맞는 여행지를 찾아드립니다.</p>
        </div>
      </div>

      <!-- Slide 3: Plan Management -->
      <div class="slide bg-2">
        <div class="glass-card">
          <div class="icon-circle">📅</div>
          <h1>간편한 일정 관리</h1>
          <p>여행 일정을 한눈에 확인하고<br>자유롭게 수정해보세요.<br>친구들과 공유도 가능합니다.</p>
        </div>
      </div>

      <!-- Slide 4: Community -->
      <div class="slide bg-3">
        <div class="glass-card">
          <div class="icon-circle">💬</div>
          <h1>여행 커뮤니티</h1>
          <p>생생한 여행 후기를 확인하고<br>나만의 특별한 여행 꿀팁을<br>공유해보세요.</p>
        </div>
      </div>

      <!-- Slide 5: Final Welcome -->
      <div class="slide final-slide bg-4">
        <div class="final-content">
          <div class="logo-area">
            <h1 class="logo-text">P-PLIP</h1>
          </div>

          <div class="center-text">
            <p class="sub-text">어디로 떠날까요?</p>
            <h2 class="main-text">부담 없는<br>여행의 시작</h2>
          </div>

          <div class="action-area">
            <button class="start-btn" @click="startApp">여행 시작하기</button>
            <div class="login-link" @click="goToLogin">로그인</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Dots -->
    <div class="dots-container" v-if="currentSlide < 4">
      <div class="dots">
        <span v-for="(dot, index) in 5" :key="index" class="dot" :class="{ active: currentSlide === index }"
          @click="goToSlide(index)"></span>
      </div>
    </div>

    <!-- Bottom Controls -->
    <div class="bottom-controls" v-if="currentSlide < 4">
      <button class="text-btn" @click="neverShowAgain">다시 보지 않기</button>
      <button class="text-btn skip-btn" @click="skip">
        <span>건너뛰기</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentSlide = ref(0);

const goToSlide = (index) => {
  currentSlide.value = index;
};

const nextSlide = () => {
  if (currentSlide.value < 4) {
    currentSlide.value++;
  }
};

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  }
};

// Navigation Logic
const startApp = () => {
  localStorage.setItem('welcome-seen', 'true');
  router.push({ name: 'main' });
};

const goToLogin = () => {
  localStorage.setItem('welcome-seen', 'true');
  router.push({ name: 'login' });
};

const neverShowAgain = () => {
  localStorage.setItem('welcome-seen', 'true');
  router.push({ name: 'main' });
};

const skip = () => {
  sessionStorage.setItem('welcome-seen-session', 'true');
  router.push({ name: 'main' });
};

// Swipe Handling
let touchStartX = 0;
let touchEndX = 0;

const onTouchStart = (e) => {
  touchStartX = e.changedTouches[0].screenX;
};

const onTouchEnd = (e) => {
  touchEndX = e.changedTouches[0].screenX;
  if (touchEndX < touchStartX - 50) nextSlide();
  if (touchEndX > touchStartX + 50) prevSlide();
};
</script>

<style scoped>
@font-face {
  font-family: 'BMJUA';
  src: url('/font/ttf/BMJUA_ttf.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.welcome-container {
  font-family: 'BMJUA', 'Noto Sans KR', sans-serif;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  color: white;
}

/* Dynamic Backgrounds */
/* Backgrounds applied directly to slides now */


.bg-0 {
  background: url('/public/welcome/1.png') center/cover no-repeat, linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Royal Blue/Purple */
.bg-1 {
  background: url('/public/welcome/2.png') center/cover no-repeat, linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
}

/* Soft Pink/Purple */
.bg-2 {
  background: url('/public/welcome/3.png') center/cover no-repeat, linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
}

/* Fresh Teal/Blue */
.bg-3 {
  background: url('/public/welcome/4.png') center/cover no-repeat, linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%);
}

/* Warm Pink */
.bg-4 {
  background: url('/public/welcome/5.gif') center/cover no-repeat, linear-gradient(to bottom, #7FABD9, #4A7C59);
}

/* Final Image fallback */

.slider {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
  z-index: 1;
}

.slide {
  min-width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  box-sizing: border-box;
  position: relative;
}

/* Glass Card Design */
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 32px;
  padding: 40px 24px;
  width: 100%;
  max-width: 340px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  animation: fadeInUp 0.8s ease-out;
}

.icon-circle {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin: 0 auto 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.brand-text {
  font-weight: 900;
  letter-spacing: 1px;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

p {
  font-size: 1.05rem;
  line-height: 1.6;
  opacity: 0.9;
  font-weight: 300;
}

/* Final Slide Specifics */
.final-slide .final-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 80px;
  padding-bottom: 120px;
  z-index: 2;
  text-align: center;
}

.logo-text {
  font-size: 3rem;
  font-weight: 900;
  letter-spacing: 4px;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.center-text {
  margin: auto 0;
}

.sub-text {
  font-size: 1.2rem;
  margin-bottom: 8px;
  opacity: 0.9;
  font-weight: 300;
}

.main-text {
  font-size: 3.2rem;
  font-weight: 700;
  line-height: 1.1;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.action-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.start-btn {
  width: 100%;
  max-width: 320px;
  padding: 18px;
  border-radius: 20px;
  background: white;
  color: #333;
  border: none;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
}

.start-btn:active {
  transform: scale(0.98);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.login-link {
  font-size: 0.95rem;
  text-decoration: underline;
  opacity: 0.8;
  cursor: pointer;
}

/* Controls & UI */
.dots-container {
  position: absolute;
  bottom: 120px;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 10;
}

.dots {
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 12px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.dot.active {
  background: white;
  transform: scale(1.2);
  width: 20px;
  border-radius: 10px;
}

.bottom-controls {
  position: absolute;
  bottom: 40px;
  width: 100%;
  padding: 0 30px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.text-btn {
  background: none;
  border: none;
  color: white;
  font-size: 0.95rem;
  opacity: 0.7;
  cursor: pointer;
  padding: 10px;
  font-weight: 500;
  transition: opacity 0.2s;
}

.text-btn:active {
  opacity: 1;
}

.skip-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.9;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
