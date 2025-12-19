<template>
  <div class="roulette-container">
    <header class="header">
      <h1>{{ headerTitle }}</h1>
      <p class="subtitle">{{ subtitleText }}</p>
    </header>

    <div class="content-wrapper">
      <!-- Grid View (Initial State) -->
      <div v-if="!isSpinning" class="grid-container">
        <div v-for="(item, index) in currentItems" :key="index" class="grid-item"
          :style="{ borderColor: colors[index % colors.length] }">
          {{ item }}
        </div>
      </div>

      <!-- Roulette View (Spinning State) -->
      <div v-else class="roulette-window">
        <!-- Center Indicator -->
        <div class="indicator"></div>

        <div class="roulette-strip" :style="{ transform: `translateX(${-currentOffset}px)` }">
          <div v-for="(item, index) in rouletteItems" :key="index" class="roulette-item"
            :class="{ 'active': index === targetIndex && isFinished }" :style="{
              backgroundColor: colors[index % colors.length],
            }">
            {{ item }}
          </div>
        </div>
      </div>

      <div class="action-area">
        <button class="spin-btn" @click="handleSpinClick" :disabled="isSpinning">
          {{ spinButtonText }}
        </button>
      </div>
    </div>

    <!-- Result Modal (Final) -->
    <div v-if="showFinalModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>여행지 확정!</h2>
        </div>
        <div class="result-text">
          <span class="location">{{ finalLocationString }}</span>
        </div>
        <p class="recommendation-text">해당 지역에서의 여행 계획을<br>추천받아 보시겠어요?</p>

        <div class="date-selection-container">
          <div class="date-inputs">
            <input type="date" v-model="startDate" class="date-input">
            <span class="separator">~</span>
            <input type="date" v-model="endDate" class="date-input">
          </div>
        </div>

        <button class="ai-recommend-btn" @click="openAiChat">
          <div class="ai-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" fill="white"
                fill-opacity="0.2" />
              <path
                d="M12 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-2 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm4 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
                fill="white" />
            </svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L14.39 8.26L21 9.27L15.92 13.73L17.5 20.22L12 16.77L6.5 20.22L8.08 13.73L3 9.27L9.61 8.26L12 2Z"
                fill="white" />
            </svg>
          </div>
          <span>AI 추천 받기</span>
        </button>

        <button class="close-btn" @click="closeModal">닫기 / 다시하기</button>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <div class="bottom-nav">
      <NavBar />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router'; // Added
import NavBar from '@/components/common/Navbar.vue';
import { attractionApi } from '@/axios/attraction';
import { usePlanStore } from '@/stores/plan';
import { useAuthStore } from '@/stores/auth'; // Added

const planStore = usePlanStore();
const authStore = useAuthStore(); // Added
const router = useRouter(); // Added

// Data placeholders
const regionData = ref({});
const sidoCodeMap = ref({});
const gugunCodeMap = ref({});

// Codes for regions that stop at Step 1 (Major Cities/Special Provinces)
const singleStepRegionCodes = [1, 2, 3, 4, 5, 6, 7, 8, 39];

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#FFCC5C', '#FF9671', '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71', '#F1C40F', '#E74C3C', '#1ABC9C', '#8E44AD', '#2C3E50'];

// State
const step = ref(1); // 1: Province, 2: District
const isSpinning = ref(false);
const showFinalModal = ref(false);
const isFinished = ref(false);

const selectedProvince = ref('');
const selectedDistrict = ref('');

// Date Selection
const startDate = ref('');
const endDate = ref('');

// Roulette Animation State
const itemWidth = 100; // Width of each box in px
const itemGap = 10;    // Gap between boxes in px
const rouletteItems = ref([]);
const currentOffset = ref(0);
const targetIndex = ref(0);

const selectedSidoCode = ref(null);
const selectedGugunCode = ref(null);

const fetchRegions = async () => {
  try {
    const res = await attractionApi.getRegions();
    console.log(res);
    // 2-char Name Mapping
    const sidoMap = {
      '세종특별자치시': '세종',
      '제주특별자치도': '제주',
      '강원특별자치도': '강원',
      '전북특별자치도': '전북',
      '경기도': '경기',
      '충청북도': '충북',
      '충청남도': '충남',
      '경상북도': '경북',
      '경상남도': '경남',
      '전라북도': '전북',
      '전라남도': '전남',
      '제주도': '제주'
    };

    const newRegionData = {};
    const newSidoCodeMap = {};
    const newGugunCodeMap = {};

    if (Array.isArray(res)) {
      res.forEach(item => {
        let sName = item.sido.sidoName;
        if (sidoMap[sName]) {
          sName = sidoMap[sName];
        } else {
          sName = sName.substring(0, 2);
        }

        const sCode = item.sido.sidoCode;
        newSidoCodeMap[sName] = sCode;

        // Map Gugun names to 2 chars and store codes
        newRegionData[sName] = [];
        newGugunCodeMap[sName] = {};

        if (item.guguns) {
          item.guguns.forEach(g => {
            const gName = g.gugunName.substring(0, 2);
            newRegionData[sName].push(gName);
            newGugunCodeMap[sName][gName] = g.gugunCode;
          });
        }
      });
    }

    regionData.value = newRegionData;
    sidoCodeMap.value = newSidoCodeMap;
    gugunCodeMap.value = newGugunCodeMap;
  } catch (error) {
    console.error('Error fetching regions:', error);
  }
};

// Computed
const provinces = computed(() => Object.keys(regionData.value));

const currentItems = computed(() => {
  if (step.value === 1) return provinces.value;
  if (step.value === 2 && selectedProvince.value) return regionData.value[selectedProvince.value] || [];
  return [];
});

const headerTitle = computed(() => {
  if (step.value === 1) return "어디로 떠날까요?";
  return `${selectedProvince.value}의 어디로?`;
});

const subtitleText = computed(() => {
  if (step.value === 1) return "아래 지역 중 하나가 선택됩니다!";
  return "상세 지역을 추첨합니다!";
});

const spinButtonText = computed(() => {
  if (isSpinning.value) return "추첨 중...";
  if (step.value === 1) return "지역 추첨 시작";
  return "상세 지역 추첨";
});

const finalLocationString = computed(() => {
  if (selectedDistrict.value) {
    return `${selectedProvince.value} ${selectedDistrict.value}`;
  }
  return selectedProvince.value;
});

onMounted(() => {
  fetchRegions();

  // Init default dates
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  startDate.value = tomorrow.toISOString().split('T')[0];
  endDate.value = dayAfter.toISOString().split('T')[0];
});

const handleSpinClick = () => {
  // Auth Check Added
  if (!authStore.isLoggedIn) {
     if (confirm('로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?')) {
       router.push({ name: 'login' });
     }
     return;
  }

  if (isSpinning.value) return;
  startRoulette();
};

const startRoulette = () => {
  const items = currentItems.value;
  if (!items || items.length === 0) return;

  isSpinning.value = true;
  showFinalModal.value = false;
  isFinished.value = false;

  // Prepare roulette strip
  // Repeat items mainly to have enough length for spinning visual
  // We need enough items to scroll for ~3 seconds.
  // Let's say we want to spin past around 50-80 items.
  const repeatCount = 20;
  rouletteItems.value = [];
  for (let i = 0; i < repeatCount; i++) {
    rouletteItems.value.push(...items);
  }

  // Calculate target
  const totalItems = rouletteItems.value.length;
  const minIndex = Math.floor(totalItems * 0.6);
  const maxIndex = Math.floor(totalItems * 0.8);
  const targetIdx = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;

  targetIndex.value = targetIdx;

  const itemWidth = 100; 
  const itemGap = 10;
  const unit = itemWidth + itemGap;
  const targetPos = (targetIdx * unit);
  
  const landingPosition = targetPos + (itemWidth / 2);

  // Animation loop
  const duration = 3000;
  const startOffset = 0;

  const startTime = performance.now();

  const animate = (time) => {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out quart
    const ease = 1 - Math.pow(1 - progress, 4);

    currentOffset.value = startOffset + (landingPosition - startOffset) * ease;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isFinished.value = true;
      setTimeout(() => {
        isSpinning.value = false;
        determineResult(rouletteItems.value[targetIdx]);
      }, 500); // Wait a bit after showing result
    }
  };

  requestAnimationFrame(animate);
};

const determineResult = (result) => {
  if (step.value === 1) {
    selectedProvince.value = result;
    const sCode = sidoCodeMap.value[result];
    selectedSidoCode.value = sCode;
    selectedGugunCode.value = null; // Reset gugun code for new province

    // Check if it's a single step region
    if (singleStepRegionCodes.includes(sCode)) {
      setTimeout(() => {
        showFinalModal.value = true;
      }, 300);
    } else {
      // Proceed to Step 2
      setTimeout(() => {
        step.value = 2;
        currentOffset.value = 0;
      }, 500);
    }
  } else {
    // Step 2 done.
    selectedDistrict.value = result;
    // Look up Gugun Code using Province and Gugun Name
    if (gugunCodeMap.value[selectedProvince.value] && gugunCodeMap.value[selectedProvince.value][result]) {
      selectedGugunCode.value = gugunCodeMap.value[selectedProvince.value][result];
    }
    showFinalModal.value = true;
  }
};

const openAiChat = () => {
  // Auth Check Added
  if (!authStore.isLoggedIn) {
     alert('로그인이 필요한 서비스입니다.');
     router.push({ name: 'login' });
     return;
  }

  if (!startDate.value || !endDate.value) {
    alert('여행 기간을 선택해주세요.');
    return;
  }

  if (startDate.value > endDate.value) {
    alert('종료일은 시작일보다 빠를 수 없습니다.');
    return;
  }

  console.log("View: Calling suggestRandomPlan with regionName:", finalLocationString.value);

  planStore.suggestRandomPlan(
    selectedSidoCode.value,
    selectedGugunCode.value || 0,
    startDate.value,
    endDate.value,
    finalLocationString.value
  );

  // Close modal immediately to allow user interaction
  closeModal();
};

const closeModal = () => {
  showFinalModal.value = false;
  step.value = 1;
  selectedProvince.value = '';
  selectedDistrict.value = '';
  currentOffset.value = 0;
  isSpinning.value = false;
};
</script>

<style scoped>
.roulette-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 80px;
  touch-action: pan-y;
  font-family: 'Pretendard', sans-serif;
}

.header {
  margin-top: 40px;
  text-align: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 28px;
  font-weight: 800;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 16px;
}

.content-wrapper {
  width: 100%;
  max-width: 360px;
  /* Constrain width for mobile look */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  margin-bottom: 20px;
}

/* Grid View */
.grid-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 10px;
}

.grid-item {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  border: 2px solid #ddd;
  font-weight: bold;
  color: #555;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  font-size: 14px;
}

/* Roulette View */
.roulette-window {
  position: relative;
  width: 300px;
  height: 120px;
  background: white;
  border-radius: 16px;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 4px solid #333;
  display: flex;
  align-items: center;
  /* Vertically center */
}

/* Red Arrow Indicator */
.indicator {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 20px solid #E74C3C;
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.roulette-strip {
  display: flex;
  gap: 10px;
  padding-left: 50%;
  /* Start somewhat offset if needed, but we handle it with script */
  will-change: transform;
}

.roulette-item {
  flex: 0 0 100px;
  /* Fixed width */
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ccc;
  border-radius: 10px;
  font-size: 20px;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.roulette-item.active {
  box-shadow: 0 0 20px #FFD700;
  border: 2px solid white;
}

.action-area {
  margin-top: 30px;
}

.spin-btn {
  padding: 15px 60px;
  font-size: 18px;
  font-weight: bold;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.4);
  transition: transform 0.1s;
}

.spin-btn:active {
  transform: scale(0.95);
}

.spin-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 20px;
}

.modal-content {
  background: white;
  padding: 30px 20px;
  border-radius: 20px;
  width: 100%;
  max-width: 320px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-header h2 {
  margin: 0 0 10px;
  font-size: 20px;
  color: #ff6b6b;
}

.result-text {
  margin: 20px 0;
}

.location {
  font-size: 36px;
  font-weight: 800;
  color: #333;
}

.recommendation-text {
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

.date-selection-container {
  width: 100%;
  margin-bottom: 20px;
}

.date-inputs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  color: #333;
  width: 130px;
}

.separator {
  color: #999;
  font-weight: bold;
}

.ai-recommend-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(118, 75, 162, 0.3);
}

.ai-icon svg {
  vertical-align: middle;
}

.close-btn {
  background: transparent;
  border: none;
  color: #999;
  text-decoration: underline;
  cursor: pointer;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  height: calc(60px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 50;
  background: white;
  border-top: 1px solid #eee;
}
</style>
