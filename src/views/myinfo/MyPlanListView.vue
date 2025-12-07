<template>
  <AppPage class="my-plan-list-page">
    <!-- Header -->
    <AppHeader title="내 플랜">
      <template #right>
        <div class="sort-wrapper">
          <button class="icon-btn more-btn" @click="toggleSortMenu" title="정렬">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="4" y1="6" x2="20" y2="6" stroke="#333" stroke-width="2" stroke-linecap="round"/>
              <line x1="8" y1="10" x2="16" y2="10" stroke="#333" stroke-width="2" stroke-linecap="round"/>
              <line x1="4" y1="14" x2="20" y2="14" stroke="#333" stroke-width="2" stroke-linecap="round"/>
              <line x1="8" y1="18" x2="16" y2="18" stroke="#333" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          
          <!-- Sort Dropdown -->
          <div v-if="isSortMenuOpen" class="sort-menu">
            <button class="sort-option" :class="{ active: sortOrder === 'desc' }" @click="setSortOrder('desc')">최신순</button>
            <button class="sort-option" :class="{ active: sortOrder === 'asc' }" @click="setSortOrder('asc')">오래된순</button>
          </div>
        </div>
      </template>
    </AppHeader>

    <!-- Tabs -->
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id" 
        class="tab-btn" 
        :class="{ active: currentTab === tab.id }"
        @click="currentTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Plan List -->
    <div class="plan-list">
      <PlanItem 
        v-for="plan in sortedPlans" 
        :key="plan.id" 
        :plan="plan" 
        @click="goToPlanDetail(plan.id)"
      />
      
      <!-- Empty State -->
      <div v-if="sortedPlans.length === 0" class="empty-state">
        <p>플랜이 없습니다.</p>
      </div>
    </div>
  </AppPage>
</template>

<script setup>

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import PlanItem from '@/components/my/PlanItem.vue';
import AppHeader from '@/components/common/AppHeader.vue';
import AppPage from '@/components/common/AppPage.vue';

const router = useRouter();

const tabs = [
  { id: 'all', label: '전체' },
  { id: 'completed', label: '완료된 여행' },
  { id: 'upcoming', label: '예정인 여행' }
];

const currentTab = ref('all');
const sortOrder = ref('desc'); // 'desc' (newest first) or 'asc' (oldest first)
const isSortMenuOpen = ref(false);

// Mock Data
const plans = ref([
  {
    id: 1,
    title: '강릉 식도락 여행',
    startDate: '2023.08.01',
    endDate: '2023.08.03',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    status: 'completed'
  },
  {
    id: 2,
    title: '제주도 힐링 캠프',
    startDate: '2023.12.20',
    endDate: '2023.12.25',
    image: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    status: 'upcoming'
  },
  {
    id: 3,
    title: '부산 바다 여행',
    startDate: '2023.05.05',
    endDate: '2023.05.07',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    status: 'completed'
  }
]);

const filteredPlans = computed(() => {
  if (currentTab.value === 'all') return plans.value;
  return plans.value.filter(plan => plan.status === currentTab.value);
});

const sortedPlans = computed(() => {
  return [...filteredPlans.value].sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB;
  });
});

const toggleSortMenu = () => {
  isSortMenuOpen.value = !isSortMenuOpen.value;
};

const setSortOrder = (order) => {
  sortOrder.value = order;
  isSortMenuOpen.value = false;
};

// Close menu when clicking outside
const closeMenu = (e) => {
  if (isSortMenuOpen.value && !e.target.closest('.sort-wrapper')) {
    isSortMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeMenu);
});

onUnmounted(() => {
  document.removeEventListener('click', closeMenu);
});

const goToPlanDetail = (id) => {
  router.push({ name: 'todo-list', params: { id } });
};
</script>

<style scoped>

/* Container replaced by AppPage */
.my-plan-list-page {
  /* Inherits traits */
}

/* Header Replaced */
.icon-btn {
  /* Only used for sort button now, kept structure */
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.tabs {
  display: flex;
  background: white;
  padding: 0 20px;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  flex: 1;
  padding: 16px 0;
  background: transparent;
  border: none;
  font-size: 15px;
  color: #888;
  font-weight: 600;
  cursor: pointer;
  position: relative;
}

.tab-btn.active {
  color: #333;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #333;
}

.plan-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #888;
  font-size: 14px;
}

.sort-wrapper {
  position: relative;
}

.sort-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 100px;
  z-index: 20;
  border: 1px solid #eee;
}

.sort-option {
  background: transparent;
  border: none;
  padding: 8px 12px;
  text-align: left;
  font-size: 14px;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.sort-option:hover {
  background: #f5f5f5;
}

.sort-option.active {
  color: #0095f6;
  font-weight: 600;
  background: #f0f7ff;
}
</style>
