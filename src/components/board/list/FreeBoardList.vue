<template>
  <div class="free-board-container">
    <!-- Filters -->
    <div class="filter-chips" v-if="filterType !== 'my-posts'">
      <button 
        class="chip" 
        :class="{ active: activeFilter === 'popular' }"
        @click="activeFilter = 'popular'"
      >
        인기순
      </button>
      <button 
        class="chip" 
        :class="{ active: activeFilter === 'latest' }"
        @click="activeFilter = 'latest'"
      >
        최신순
      </button>
    </div>

    <!-- Grid -->
    <div class="post-grid">
      <FreeBoardListItem
        v-for="post in displayPosts"
        :key="post.id"
        :post="post"
        :filterType="filterType"
        @click="goToDetail(post.id)"
        @edit="goToEdit(post.id)"
      />
    </div>

    <!-- Write FAB -->
    <button class="write-fab" @click="goToWrite" v-if="filterType !== 'my-posts'">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFreeBoardStore } from '@/stores/freeboard';
import FreeBoardListItem from './FreeBoardListItem.vue';

const props = defineProps({
  filterType: {
    type: String,
    default: 'all' // 'all', 'my-posts'
  },
  sortOrder: {
    type: String,
    default: 'desc' // 'desc' (latest), 'asc' (oldest)
  }
});

const router = useRouter();
const store = useFreeBoardStore();
const activeFilter = ref('popular');

const goToWrite = () => {
  router.push({ name: 'freeboard-write' });
};
const goToDetail = (id) => {
  router.push({ name: 'freeboard-detail', params: { id } });
};

const goToEdit = (id) => {
  router.push({ name: 'freeboard-write', query: { id } });
};

const displayPosts = computed(() => {
  // TODO: filterType이 my-posts일 때는 사용자 작성 게시판 리스트 api 사용, 아니면 게시판 리스트 api 사용
  let filtered = [...store.freeBoards];
  
  if (props.filterType === 'my-posts') {
    filtered = filtered.filter(post => post.author === '탐험가 Alex');
    
    // Sort by date based on sortOrder prop
    filtered.sort((a, b) => {
      const dateA = new Date(a.date); // Assuming post has a date field
      const dateB = new Date(b.date);
      return props.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  } else {
    // Existing filter logic for 'all'
    if (activeFilter.value === 'latest') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (activeFilter.value === 'popular') {
      filtered.sort((a, b) => b.likes - a.likes);
    }
  }
  
  return filtered;
});
</script>

<style scoped>
.free-board-container {
  padding: 20px;
}

.filter-chips {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.chip {
  padding: 8px 16px;
  background: #f0f0f0;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.chip.active {
  background: #87CEEB; /* Sky blue */
  color: white;
  font-weight: 600;
}

.post-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.write-fab {
  position: absolute;
  bottom: calc(80px + env(safe-area-inset-bottom));
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #00BFFF; /* Bright blue for + button */
  border: none;
  box-shadow: 0 4px 12px rgba(0,191,255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 35; /* Below Chat FAB (40) if both exist, or maybe Chat FAB should be higher? */
  cursor: pointer;
  transition: transform 0.2s;
}

.write-fab:active {
  transform: scale(0.95);
}
</style>