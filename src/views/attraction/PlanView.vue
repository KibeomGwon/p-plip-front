<template>
  <div class="plan-container">
    <div class="scroll-container">
      <header class="header">
        <h1>플랜</h1>
      </header>

      <div class="content">
        <!-- Section: Ongoing Trips -->
        <section class="section ongoing-section">
          <h2 class="section-title">진행 중인 여행</h2>
          <div 
            class="ongoing-list" 
            ref="scrollContainer"
            @mousedown="startDrag"
            @mouseleave="stopDrag"
            @mouseup="stopDrag"
            @mousemove="onDrag"
          >
            <!-- Card Item -->
            <div v-for="trip in ongoingTrips" :key="trip.id" class="ongoing-card">
              <div class="card-image-wrapper" :style="{ backgroundImage: `url(${trip.image})` }">
                <span class="d-day-badge">D-{{ trip.dDay }}</span>
                <div class="card-overlay">
                  <h3 class="trip-title">{{ trip.title }}</h3>
                  <p class="trip-date">{{ trip.date }}</p>
                </div>
              </div>
              <div class="card-footer">
                <div class="progress-bar-container">
                  <div class="progress-bar" :style="{ width: trip.progress + '%' }"></div>
                </div>
                <div class="progress-info">
                  <span>{{ trip.progress }}%</span>
                  <button class="continue-btn" @click="continuePlan(trip.id)">이어서 계획하기</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Section: Past Trips -->
        <section class="section past-section">
          <h2 class="section-title">지난 여행</h2>
          <div class="past-list">
            <div v-for="trip in pastTrips" :key="trip.id" class="past-card">
              <div class="past-card-image" :style="{ backgroundImage: `url(${trip.image})` }"></div>
              <div class="past-card-info">
                <h3 class="past-trip-title">{{ trip.title }}</h3>
                <p class="past-trip-date">{{ trip.date }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Floating Action Button -->
    <button class="fab" @click="createNewPlan">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>

    <!-- Bottom Navigation -->
    <div class="bottom-nav">
      <NavBar />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import NavBar from '@/components/common/Navbar.vue';

const ongoingTrips = ref([
  {
    id: 1,
    title: '제주도 힐링 여행',
    date: '2023.11.15 - 2023.11.18',
    dDay: 5,
    progress: 20,
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 2,
    title: '부산 먹방 투어',
    date: '2023.12.20 - 2023.12.22',
    dDay: 35,
    progress: 0,
    image: 'https://images.unsplash.com/photo-1634882194607-d57b49467652?q=80&w=800&auto=format&fit=crop'
  }
]);

const pastTrips = ref([
  {
    id: 101,
    title: '강릉 식도락 여행',
    date: '2023.08.01 - 2023.08.03',
    image: 'https://images.unsplash.com/photo-1554652285-b9f2ad8708c0?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 102,
    title: '부산 뚜벅이 여행',
    date: '2023.05.10 - 2023.05.12',
    image: 'https://images.unsplash.com/photo-1582218000305-6497fba9d168?q=80&w=400&auto=format&fit=crop'
  }
]);

const continuePlan = (id) => {
  console.log('Continue plan', id);
};

const createNewPlan = () => {
  console.log('Create new plan');
};

// Drag to Scroll Logic
const scrollContainer = ref(null);
const isDown = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);

const startDrag = (e) => {
  isDown.value = true;
  startX.value = e.pageX - scrollContainer.value.offsetLeft;
  scrollLeft.value = scrollContainer.value.scrollLeft;
};

const stopDrag = () => {
  isDown.value = false;
};

const onDrag = (e) => {
  if (!isDown.value) return;
  e.preventDefault();
  const x = e.pageX - scrollContainer.value.offsetLeft;
  const walk = (x - startX.value) * 2; // Scroll-fast
  scrollContainer.value.scrollLeft = scrollLeft.value - walk;
};
</script>

<style scoped>
.plan-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 100px; /* Space for FAB and Bottom Nav */
}

.header {
  padding: 20px;
}

.header h1 {
  font-size: 28px;
  font-weight: 800;
  color: #111;
  margin: 0;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section {
  padding: 0 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #111;
}

/* Ongoing Trips Carousel */
.ongoing-list {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 1px; /* Avoid clip */
  /* Hide scrollbar */
  scrollbar-width: none; 
}
.ongoing-list::-webkit-scrollbar {
  display: none;
}

.ongoing-card {
  min-width: 300px;
  width: 90%; /* On mobile, almost full width */
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  flex-shrink: 0;
}

.card-image-wrapper {
  position: relative;
  height: 200px;
  background-size: cover;
  background-position: center;
}

.d-day-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background-color: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
  color: white;
}

.trip-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 4px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.trip-date {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
}

.card-footer {
  padding: 16px;
}

.progress-bar-container {
  height: 6px;
  background-color: #eee;
  border-radius: 3px;
  margin-bottom: 12px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #007bff;
  border-radius: 3px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.continue-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

/* Past Trips List */
.past-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.past-card {
  display: flex;
  gap: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #f0f0f0;
  overflow: hidden;
  height: 100px; /* Fixed height for consistency */
}

.past-card-image {
  width: 100px;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-color: #eee;
}

.past-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 16px;
}

.past-trip-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 6px;
  color: #333;
}

.past-trip-date {
  font-size: 13px;
  color: #888;
  margin: 0;
}

/* FAB */
.fab {
  position: absolute;
  bottom: 100px; /* Above navbar */
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #00bfff; /* Cyan/Blue tone */
  border: none;
  box-shadow: 0 4px 12px rgba(0, 191, 255, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 100;
}

.fab:active {
  transform: scale(0.95);
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