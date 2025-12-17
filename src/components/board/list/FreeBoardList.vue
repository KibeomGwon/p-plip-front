<template>
  <div class="free-board-container">
    <!-- Filters -->
    <div class="filter-wrapper" v-if="filterType !== 'my-posts'">
      <SortFilter 
        v-model="activeFilter" 
        :options="sortOptions"
      />
    </div>

    <!-- Grid -->
    <div class="post-grid">
      <div v-if="!isLoading && displayPosts.length === 0" class="empty-state">
        <p>아직 작성된 글이 없습니다.</p>
      </div>
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { boardApi } from '@/axios/board';
import FreeBoardListItem from './FreeBoardListItem.vue';
import SortFilter from '@/components/common/SortFilter.vue';

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
const authStore = useAuthStore();
const activeFilter = ref('popular');
const posts = ref([]);
const isLoading = ref(false);
const pageInfo = ref({
  pageNo: 1,
  pageSize: 10,
  totalCount: 0,
  totalPage: 0,
  startPage: 0,
  endPage: 0,
  prev: false,
  next: false
});

const sortOptions = [
  { label: '인기순', value: 'popular' },
  { label: '최신순', value: 'fast' }
];

const goToWrite = () => {
  if (!authStore.isLoggedIn) {
     alert("로그인이 필요합니다.");
     router.push({ 
       name: 'login', 
       query: { redirect: router.currentRoute.value.fullPath } 
     });
     return;
  }
  router.push({ name: 'freeboard-write' });
};
const goToDetail = (id) => {
  router.push({ name: 'freeboard-detail', params: { id } });
};

const goToEdit = (id) => {
  router.push({ name: 'freeboard-modify', params: { id } });
};

const fetchPosts = async (isLoadMore = false) => {
  isLoading.value = true;
  
  try {
      if (props.filterType === 'my-posts') {
            // Free Board My Posts
            const apiSort = props.sortOrder === 'desc' ? 'FAST' : 'LATEST';
            const res = await boardApi.getMyPostFreeBoardList(apiSort);
            
            if (res && res.list) {
              if (isLoadMore) {
                posts.value = [...posts.value, ...res.list];
              } else {
                posts.value = [...res.list];
              }
              
              pageInfo.value = {
                pageNo: res.pageNo,
                pageSize: res.pageSize,
                totalCount: res.totalCount,
                totalPage: res.totalPage,
                startPage: res.startPage,
                endPage: res.endPage,
                prev: res.prev,
                next: res.next
              };
            }
      } else {
        // Normal List (Not My Posts) - Keeping existing logic regarding Sort
        const sortValue = activeFilter.value === 'popular' ? 'POPULAR' : 'FAST';
        const res = await boardApi.getFreeBoardList(sortValue);
        
        if (res && res.list) {
          if (isLoadMore) {
            posts.value = [...posts.value, ...res.list];
          } else {
            posts.value = [...res.list];
          }
          
          pageInfo.value = {
            pageNo: res.pageNo,
            pageSize: res.pageSize,
            totalCount: res.totalCount,
            totalPage: res.totalPage,
            startPage: res.startPage,
            endPage: res.endPage,
            prev: res.prev,
            next: res.next
          };
        }
      }
  } catch (error) {
    console.error('Error fetching board list:', error);
    if (!isLoadMore) posts.value = [];
    alert(error.message);
  } finally {
    isLoading.value = false;
  }
};

const loadMore = () => {
  if (pageInfo.value.next && !isLoading.value) {
    pageInfo.value.pageNo++;
    fetchPosts(true);
  }
};

onMounted(() => {
  fetchPosts();
});

watch(activeFilter, () => {
  pageInfo.value.pageNo = 1;
  fetchPosts();
});

watch(() => props.sortOrder, () => {
  if (props.filterType === 'my-posts') {
    pageInfo.value.pageNo = 1;
    fetchPosts();
  }
});

const displayPosts = computed(() => {
  return posts.value;
});

defineExpose({
  loadMore,
  isLoading,
  pageInfo
});
</script>

<style scoped>
.free-board-container {
  padding: 20px;
}

.filter-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
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

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  color: #888;
  font-size: 14px;
}
</style>