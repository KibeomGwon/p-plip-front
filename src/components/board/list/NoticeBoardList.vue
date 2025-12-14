<template>
  <div class="notice-board-container">
    <div class="filter-wrapper" v-if="!hideFilter">
      <SortFilter 
        v-model="currentSort" 
        :options="sortOptions" 
      />
    </div>

    <div class="notice-list">
      <div v-for="notice in sortedNotices" :key="notice.id" class="notice-item" @click="goToDetail(notice.id)">
        <div class="notice-tag">공지</div>
        <h3 class="notice-title">{{ notice.title }}</h3>
        <span class="notice-date">{{ notice.createdAt?.split('T')[0] || notice.date }} · 조회 {{ notice.viewCnt || 0 }}</span>
      </div>
    </div>

    <!-- Write FAB (Admin Only) -->
    <button class="write-fab" @click="goToWrite" v-if="authStore.userRole === 'ADMIN' && !hideFilter">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { boardApi } from '@/api/board';
import SortFilter from '@/components/common/SortFilter.vue';

const props = defineProps({
  hideFilter: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: String,
    default: 'desc'
  },
  filterType: {
    type: String,
    default: 'all' // 'all', 'my-posts'
  }
});

const router = useRouter();
const authStore = useAuthStore();

const currentSort = ref(props.sortOrder);
const sortOptions = [
  { label: '최신순', value: 'desc' },
  { label: '오래된순', value: 'asc' }
];

const notices = ref([]);

watch(() => props.sortOrder, (newVal) => {
    currentSort.value = newVal;
});

const getNotices = async () => {
  try {
    let res;
    if (props.filterType === 'my-posts') {
        res = await boardApi.getMyPostNoticeBoardList();
    } else {
        res = await boardApi.getNoticeBoardList();
    }
    
    notices.value = Array.isArray(res) ? res : (res.list || []);
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  getNotices();
});

const sortedNotices = computed(() => {
  const sorted = [...notices.value];
  sorted.sort((a, b) => {
    // Assuming createdAt is the field from DB
    const dateA = a.createdAt || a.date;
    const dateB = b.createdAt || b.date;
    return currentSort.value === 'desc' 
      ? new Date(dateB) - new Date(dateA)
      : new Date(dateA) - new Date(dateB);
  });
  return sorted;
});

const goToDetail = (id) => {
  router.push({ name: 'noticeboard-detail', params: { id } });
};

const goToWrite = () => {
  router.push({ name: 'noticeboard-write' });
};
</script>

<style scoped>
.notice-board-container {
  padding: 20px;
}

.filter-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.notice-item:active {
  background: #f9f9f9;
}

.notice-tag {
  align-self: flex-start;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 11px;
  color: #666;
  font-weight: 600;
}

.notice-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.4;
}

.notice-date {
  font-size: 12px;
  color: #999;
  align-self: flex-end;
}

.write-fab {
  position: absolute;
  bottom: calc(80px + env(safe-area-inset-bottom));
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #00BFFF; 
  border: none;
  box-shadow: 0 4px 12px rgba(0,191,255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 35;
  cursor: pointer;
  transition: transform 0.2s;
}

.write-fab:active {
  transform: scale(0.95);
}
</style>