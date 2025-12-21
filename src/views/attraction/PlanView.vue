<template>
  <div class="plan-container">
    <div class="scroll-container">
      <header class="header">
        <h1>플랜</h1>
      </header>

      <div class="content">
        <!-- Section: Ongoing Trips -->
        <section class="section ongoing-section">
          <div class="section-header">
            <h2 class="section-title">진행 중인 여행</h2>
            <SortFilter v-model="ongoingSortOrder" :options="ongoingSortOptions" />
          </div>
          <div class="ongoing-list" ref="ongoingListRef" @mousedown="startDrag($event, 'ongoing')"
            @mouseleave="stopDrag" @mouseup="stopDrag" @mousemove="onDrag($event, 'ongoing')"
            @wheel="onWheel($event, 'ongoing')">
            <!-- Loading Card -->
            <div v-if="planStore.isGeneratingPlan" class="loading-card">
              <div class="spinner"></div>
              <span>AI가 계획을 생성중입니다...</span>
            </div>

            <!-- Card Item -->
            <TripCard v-for="trip in sortedOngoingTrips" :key="trip.id" :trip="trip" />
          </div>
        </section>

        <!-- Create Normal Plan Button -->
        <!-- Create Normal Plan Button -->
        <button class="fab-normal" @click="openCreateModal">
          📝
        </button>

        <!-- Section: Past Trips -->
        <!-- Section: Past Trips -->
        <section class="section past-section">
          <div class="section-header">
            <h2 class="section-title">지난 여행</h2>
            <SortFilter v-model="pastSortOrder" />
          </div>
          <div class="ongoing-list" ref="pastListRef" @mousedown="startDrag($event, 'past')" @mouseleave="stopDrag"
            @mouseup="stopDrag" @mousemove="onDrag($event, 'past')" @wheel="onWheel($event, 'past')">
            <TripCard v-for="trip in sortedPastTrips" :key="trip.id" :trip="trip" />
          </div>
        </section>

        <!-- Section: Planning Trips -->
        <section class="section planning-section">
          <div class="section-header">
            <h2 class="section-title">계획 중인 여행</h2>
            <!-- Sort Filter removed as requested -->
          </div>
          <div class="ongoing-list" ref="planningListRef" @mousedown="startDrag($event, 'planning')"
            @mouseleave="stopDrag" @mouseup="stopDrag" @mousemove="onDrag($event, 'planning')"
            @wheel="onWheel($event, 'planning')">
            <TripCard v-for="trip in sortedPlanningTrips" :key="trip.id" :trip="trip" />
          </div>
        </section>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <div class="bottom-nav">
      <NavBar />
    </div>

    <PlanCreateModal v-model="isCreateModalVisible" @confirm="handleCreatePlan" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import NavBar from '@/components/common/Navbar.vue';
import TripCard from '@/components/attraction/TripCard.vue';
import SortFilter from '@/components/common/SortFilter.vue';
import { usePlanStore } from '@/stores/plan';
import { planApi } from '@/axios/plan';
import { useToastStore } from '@/stores/toast';
import PlanCreateModal from '@/components/attraction/PlanCreateModal.vue';

const planStore = usePlanStore();
const toastStore = useToastStore();
const isCreateModalVisible = ref(false);

const openCreateModal = () => {
  isCreateModalVisible.value = true;
};

const handleCreatePlan = async (title) => {
  try {
    const response = await planApi.createPlan(title);
    if (response) {
      toastStore.addToast('여행 계획이 생성되었습니다!', 'success');
      planStore.fetchPlans(); // Refresh list
    }
  } catch (error) {
    console.error("Create plan error:", error);
    toastStore.addToast('계획 생성 중 오류가 발생했습니다.', 'error');
  }
};

const ongoingSortOrder = ref('desc');
const pastSortOrder = ref('desc');
const planningSortOrder = ref('desc');

onMounted(() => {
  planStore.fetchPlans();
});

const calculateProgress = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const today = new Date();

  // Reset hours for accurate date comparison
  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (today < startDate) return 0;
  if (today > endDate) return 100;

  const total = endDate - startDate;
  if (total <= 0) return 100; // Single day trip or invalid

  const elapsed = today - startDate;
  return Math.round((elapsed / total) * 100);
};

const processedOngoingTrips = computed(() => {
  return planStore.ongoingPlans.map(plan => ({
    ...plan,
    image: plan.thumbnail, // Map API 'thumbnail' to UI 'image'
    progress: plan.completedRate.toFixed(1) //calculateProgress(plan.startDate, plan.endDate)
  }));
});

const processedPastTrips = computed(() => {
  return planStore.pastPlans.map(plan => ({
    ...plan,
    image: plan.thumbnail,
    progress: 100 // Past trips are always 100%
  }));
});

const processedPlanningTrips = computed(() => {
  return planStore.planningPlans.map(plan => ({
    ...plan,
    image: plan.thumbnail,
    progress: 0
  }));
});

const ongoingSortOptions = [
  { label: '최신순', value: 'desc' },
  { label: '오래된순', value: 'asc' },
  { label: '다가오는순', value: 'closest' }
];

const sortTrips = (trips, order) => {
  return [...trips].sort((a, b) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateA = a.startDate ? new Date(a.startDate) : new Date(a.createdAt || 0);
    const dateB = b.startDate ? new Date(b.startDate) : new Date(b.createdAt || 0);

    if (order === 'closest') {
      // Calculate absolute difference from today
      const diffA = Math.abs(dateA - today);
      const diffB = Math.abs(dateB - today);
      return diffA - diffB;
    }

    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

const sortedOngoingTrips = computed(() => sortTrips(processedOngoingTrips.value, ongoingSortOrder.value));
const sortedPastTrips = computed(() => sortTrips(processedPastTrips.value, pastSortOrder.value));
const sortedPlanningTrips = computed(() => sortTrips(processedPlanningTrips.value, planningSortOrder.value));

const continuePlan = (id) => {
  console.log('Continue plan', id);
};

// Drag & Wheel Scroll Logic
const ongoingListRef = ref(null);
const pastListRef = ref(null);
const planningListRef = ref(null);

const isDown = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);
const activeContainer = ref(null);

const getContainer = (type) => {
  if (type === 'ongoing') return ongoingListRef.value;
  if (type === 'past') return pastListRef.value;
  return planningListRef.value;
};

const startDrag = (e, type) => {
  isDown.value = true;
  activeContainer.value = getContainer(type);
  startX.value = e.pageX - activeContainer.value.offsetLeft;
  scrollLeft.value = activeContainer.value.scrollLeft;
};

const stopDrag = () => {
  isDown.value = false;
  activeContainer.value = null;
};

const onDrag = (e, type) => {
  if (!isDown.value) return;
  const container = getContainer(type);
  if (activeContainer.value !== container) return; // Prevent dragging wrong container

  e.preventDefault();
  const x = e.pageX - container.offsetLeft;
  const walk = (x - startX.value) * 2; // Scroll-fast
  container.scrollLeft = scrollLeft.value - walk;
};

const onWheel = (e, type) => {
  const container = getContainer(type);
  if (container) {
    e.preventDefault();
    e.stopPropagation();
    container.scrollLeft += e.deltaY;
  }
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
  touch-action: none;
  /* Prevent whole page drag */
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 100px;
  /* Space for FAB and Bottom Nav */
  touch-action: pan-y;
  /* Allow vertical scrolling */
  overscroll-behavior: contain;
}

.scroll-container::-webkit-scrollbar {
  width: 6px;
  background-color: transparent;
}

.scroll-container::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 3px;
}

.scroll-container:hover::-webkit-scrollbar-thumb,
.scroll-container:active::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #111;
  margin: 0;
}

/* Ongoing Trips Carousel */
.ongoing-list {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 1px;
  /* Avoid clip */
  /* Hide scrollbar */
  scrollbar-width: none;
  touch-action: pan-x pan-y;
  /* Allow horizontal scroll and vertical page scroll */
}

.ongoing-list::-webkit-scrollbar {
  display: none;
}

/* Loading Card */
.loading-card {
  min-width: 240px;
  width: 72%;
  height: 220px;
  /* Approximate height matching TripCard */
  background: #f8f9fa;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #666;
  font-weight: 600;
  font-size: 14px;
  border: 2px dashed #e0e0e0;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #eee;
  border-top-color: #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* FAB */
.fab {
  position: absolute;
  bottom: 100px;
  /* Above navbar */
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #00bfff;
  /* Cyan/Blue tone */
  border: none;
  box-shadow: 0 4px 12px rgba(0, 191, 255, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 100;
}

.fab-normal {
  position: absolute;
  bottom: 90px;
  /* Above the other FAB if present, or just higher */
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #2196F3;
  /* Blue */
  border: none;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 100;
  font-size: 24px;
}

.fab-normal:active {
  transform: scale(0.95);
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
