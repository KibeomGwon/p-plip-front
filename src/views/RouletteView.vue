<template>
  <div class="roulette-container">
    <header class="header">
      <h1>{{ headerTitle }}</h1>
      <p class="subtitle">{{ subtitleText }}</p>
    </header>

    <div class="roulette-wrapper">
      <div class="wheel-container">
        <canvas ref="canvas" width="300" height="300"></canvas>
        <div class="wheel-pointer"></div>
      </div>
      
      <button 
        class="spin-btn" 
        @click="handleSpinClick" 
        :disabled="isSpinning"
      >
        {{ spinButtonText }}
      </button>
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
        
        <button class="ai-recommend-btn" @click="openAiChat">
          <div class="ai-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" fill="white" fill-opacity="0.2"/>
              <path d="M12 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-2 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm4 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill="white"/>
            </svg>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.39 8.26L21 9.27L15.92 13.73L17.5 20.22L12 16.77L6.5 20.22L8.08 13.73L3 9.27L9.61 8.26L12 2Z" fill="white"/>
             </svg>
          </div>
          <span>AI 추천 받기</span>
        </button>
        
        <button class="close-btn" @click="closeModal">닫기 / 다시하기</button>
      </div>
    </div>

    <!-- Intermediate Result Toast/Modal (Optional, using header update for now but alert for clarity) -->
    
    <!-- Bottom Navigation -->
    <div class="bottom-nav">
      <NavBar />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import NavBar from '@/components/common/Navbar.vue';

// Data
const regionData = {
  '서울': ['강남구', '홍대/신촌', '종로/인사동', '이태원', '잠실', '여의도', '성수동'],
  '경기': ['수원', '용인', '가평', '양평', '파주', '성남', '고양'],
  '부산': ['해운대', '광안리', '남포동', '서면', '기장', '영도'],
  '제주': ['제주시', '서귀포시', '애월', '함덕', '성산', '중문'],
  '인천': ['송도', '차이나타운', '월미도', '강화도', '부평'],
  '강원': ['강릉', '속초', '양양', '춘천', '평창', '원주'],
  '경북': ['경주', '포항', '안동', '구미', '울릉도', '영주'],
  '전남': ['여수', '순천', '목포', '담양', '보성'],
  '전북': ['전주', '군산', '남원', '익산', '부안'],
  '충남': ['천안', '공주', '보령', '태안', '부여'],
  '충북': ['청주', '충주', '제천', '단양'],
  '경남': ['창원', '통영', '거제', '진주', '남해'],
  '대구': ['동성로', '수성못', '김광석거리', '앞산'],
  '대전': ['은행동', '둔산동', '유성온천', '대청호'],
  '광주': ['충장로', '무등산', '양림동'],
  '울산': ['간절곶', '대왕암', '태화강'],
  '세종': ['세종시'] 
};

const provinces = Object.keys(regionData);
const singleStepRegions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종'];
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#FFCC5C', '#FF9671', '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71', '#F1C40F', '#E74C3C', '#1ABC9C', '#8E44AD', '#2C3E50'];

// State
const step = ref(1); // 1: Province, 2: District
const canvas = ref(null);
const isSpinning = ref(false);
const showFinalModal = ref(false);

const selectedProvince = ref('');
const selectedDistrict = ref('');
const currentRotation = ref(0);

// Computed
const currentItems = computed(() => {
  if (step.value === 1) return provinces;
  if (step.value === 2 && selectedProvince.value) return regionData[selectedProvince.value];
  return [];
});

const headerTitle = computed(() => {
  if (step.value === 1) return "어디로 떠날까요?";
  return `${selectedProvince.value}의 어디로?`;
});

const subtitleText = computed(() => {
  if (step.value === 1) return "돌림판을 돌려 시/도를 정해보세요!";
  return "상세 지역을 추첨합니다!";
});

const spinButtonText = computed(() => {
  if (isSpinning.value) return "돌아가는 중...";
  if (step.value === 1) return "지역 추첨 시작";
  return "상세 지역 추첨";
});

const finalLocationString = computed(() => {
  if (selectedDistrict.value) {
    return `${selectedProvince.value} ${selectedDistrict.value}`;
  }
  return selectedProvince.value;
});

// Watch
watch(currentItems, () => {
  // Redraw wheel when items change
  drawWheel();
});

onMounted(() => {
  drawWheel();
});

const drawWheel = () => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext('2d');
  const width = canvas.value.width;
  const height = canvas.value.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width / 2 - 10;
  
  const items = currentItems.value;
  if (items.length === 0) return;
  
  const arc = (2 * Math.PI) / items.length;

  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(currentRotation.value);

  for (let i = 0; i < items.length; i++) {
    const angle = i * arc;
    
    // Slice
    ctx.beginPath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, angle, angle + arc);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.save();
    ctx.translate(Math.cos(angle + arc / 2) * (radius * 0.65), Math.sin(angle + arc / 2) * (radius * 0.65));
    ctx.rotate(angle + arc / 2 + Math.PI / 2);
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(items[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();
};

const handleSpinClick = () => {
  if (isSpinning.value) return;
  spinWheel();
};

const spinWheel = () => {
  isSpinning.value = true;
  showFinalModal.value = false;

  const duration = 3000; 
  const startVal = currentRotation.value;
  const randomSpin = Math.random() * 2 * Math.PI + (10 * 2 * Math.PI); 
  const targetRotation = startVal + randomSpin;
  
  const startTime = performance.now();

  const animate = (time) => {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    
    currentRotation.value = startVal + (targetRotation - startVal) * ease;
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning.value = false;
      determineResult();
    }
  };

  requestAnimationFrame(animate);
};

const determineResult = () => {
  const items = currentItems.value;
  const arc = (2 * Math.PI) / items.length;
  // Pointer is at Top (1.5 PI)
  const angleAtPointer = (3 * Math.PI / 2 - currentRotation.value) % (2 * Math.PI);
  let effectiveAngle = angleAtPointer;
  if (effectiveAngle < 0) effectiveAngle += 2 * Math.PI;
  
  const index = Math.floor(effectiveAngle / arc);
  const result = items[index];

  if (step.value === 1) {
    selectedProvince.value = result;
    
    // Check if it's a single step region
    if (singleStepRegions.includes(result)) {
      setTimeout(() => {
        showFinalModal.value = true;
      }, 500);
    } else {
      // Proceed to Step 2
      setTimeout(() => {
        step.value = 2; // This triggers computed updates
        currentRotation.value = 0; // Reset rotation for new wheel
        drawWheel(); // Force redraw with new items
      }, 1000);
    }
  } else {
    // Step 2 done.
    selectedDistrict.value = result;
    showFinalModal.value = true;
  }
};

const openAiChat = () => {
  alert(`AI에게 ${finalLocationString.value} 여행 계획을 물어봅니다! (채팅 모달 연동 예정)`);
};

const closeModal = () => {
  // Reset completely
  showFinalModal.value = false;
  step.value = 1;
  selectedProvince.value = '';
  selectedDistrict.value = '';
  currentRotation.value = 0;
  drawWheel();
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
  touch-action: pan-y; /* Allow vertical scrolling */
  overscroll-behavior: contain;
}

.header {
  margin-top: 40px;
  text-align: center;
  margin-bottom: 40px;
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

.roulette-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.wheel-container {
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  background: white;
  overflow: hidden; /* To clip canvas if needed, though canvas is round drawn */
}

/* Pointer at the top */
.wheel-pointer {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0; 
  height: 0; 
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 30px solid #333;
  z-index: 10;
}

.spin-btn {
  padding: 15px 50px;
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
  background: rgba(0,0,0,0.5);
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
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
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
