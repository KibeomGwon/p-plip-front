<template>
  <div class="search-bar-container">
    <div class="search-input-wrapper">
      <span class="search-icon" @click="handleSearch">🔍</span>
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="장소 또는 지역 검색" 
        class="search-input"
        @keyup.enter="handleSearch"
        @focus="openHistory"
        @blur="closeHistory"
      >
      <!-- Divider -->
      <div class="divider"></div>
      
      <!-- Distance Dropdown -->
      <div class="distance-dropdown-container">
        <button class="dist-trigger-btn" @click="toggleDropdown">
          {{ isNoLimit ? '제한없음' : searchDist + 'km' }}
          <span class="chevron">▼</span>
        </button>
        
        <div v-if="isDropdownOpen" class="dist-dropdown-menu">
          <div 
            v-for="dist in [1, 3, 5, 10, 20]" 
            :key="dist"
            class="dist-option"
            :class="{ active: !isNoLimit && searchDist === dist }"
            @click="selectDistance(dist)"
          >
            {{ dist }}km (반경)
          </div>
          <div class="dropdown-divider"></div>
          <div 
            class="dist-option" 
            :class="{ active: isNoLimit }"
            @click="selectNoLimit"
          >
            제한없음 (전국)
          </div>
        </div>
      </div>
    </div>
      <!-- Search History Dropdown -->
      <div 
        v-if="isHistoryOpen && authStore.isLoggedIn" 
        class="history-dropdown"
        @mousedown.prevent 
      >
        <div v-if="searchHistory.length > 0">
          <div 
            v-for="item in searchHistory" 
            :key="item.id" 
            class="history-item"
            @click="selectHistoryItem(item.keyword)"
          >
            <span class="history-text">{{ item.keyword }}</span>
            <button class="delete-btn" @click="(e) => deleteHistoryItem(e, item.id)">
              &times;
            </button>
          </div>
          <!-- Sentinel for Infinite Scroll -->
          <div ref="sentinelRef" class="sentinel"></div>
        </div>
        <div v-else-if="!isLoadingHistory" class="empty-history">
          검색 기록이 없습니다.
        </div>
      </div>
  </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { attractionApi } from '@/axios/attraction';
import { useAuthStore } from '@/stores/auth';

const emit = defineEmits(['search']);

const authStore = useAuthStore();
const searchQuery = ref('');
const searchDist = ref(1); // Default 1km
const isNoLimit = ref(false);
const isDropdownOpen = ref(false);

// Search History State
const searchHistory = ref([]);
const isHistoryOpen = ref(false);
const historyPage = ref(1);
const historyPageSize = 5;
const hasMoreHistory = ref(true);
const isLoadingHistory = ref(false);
const historyObserver = ref(null);
const sentinelRef = ref(null);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value) isHistoryOpen.value = false;
};

const selectDistance = (dist) => {
  searchDist.value = dist;
  isNoLimit.value = false;
  isDropdownOpen.value = false;
  handleSearch();
};

const selectNoLimit = () => {
  isNoLimit.value = true;
  isDropdownOpen.value = false;
  handleSearch();
};

const handleSearch = () => {
  isHistoryOpen.value = false;
  emit('search', {
    query: searchQuery.value,
    dist: isNoLimit.value ? -1 : searchDist.value
  });
};

// History Handling
const openHistory = () => {
  if (authStore.isLoggedIn && !isHistoryOpen.value) {
    isHistoryOpen.value = true;
    isDropdownOpen.value = false;
    // Reset and fetch
    historyPage.value = 1;
    searchHistory.value = [];
    hasMoreHistory.value = true;
    fetchSearchHistory();
  }
};

const closeHistory = () => {
  // Delay slightly to allow click events on history items to register
  setTimeout(() => {
    isHistoryOpen.value = false;
  }, 200);
};

const fetchSearchHistory = async () => {
  if (isLoadingHistory.value || !hasMoreHistory.value) return;
  
  isLoadingHistory.value = true;
  try {
    const res = await attractionApi.getSearchHistory({
      page: historyPage.value,
      size: historyPageSize
    });
    
    // Assuming API returns { list: [], hasNext: boolean } or similar standard
    // Adjust based on actual API response structure. 
    // If user didn't specify return structure, I assume list.
    // The user said "Paging... fetch 5". 
    // Usually standard is list.
    const list = res.data?.list || res.list || res || [];
    
    if (list.length < historyPageSize) {
      hasMoreHistory.value = false;
    }
    
    if (historyPage.value === 1) {
      searchHistory.value = list;
    } else {
      searchHistory.value = [...searchHistory.value, ...list];
    }
    
    if (list.length > 0) {
      historyPage.value++;
    } else {
       hasMoreHistory.value = false;
    }
    
  } catch (err) {
    console.error("Failed to fetch search history", err);
  } finally {
    isLoadingHistory.value = false;
  }
};

const selectHistoryItem = (keyword) => {
  searchQuery.value = keyword;
  handleSearch();
};

const deleteHistoryItem = async (e, id) => {
  e.stopPropagation(); // Prevent item selection
  try {
    await attractionApi.deleteSearchHistory(id);
    searchHistory.value = searchHistory.value.filter(item => item.id !== id);
  } catch (err) {
    console.error("Failed to delete history item", err);
  }
};

// Intersection Observer for Infinite Scroll
const setupObserver = () => {
  if (historyObserver.value) historyObserver.value.disconnect();
  
  historyObserver.value = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMoreHistory.value) {
      fetchSearchHistory();
    }
  }, { threshold: 0.5 });
  
  if (sentinelRef.value) {
    historyObserver.value.observe(sentinelRef.value);
  }
};

watch(isHistoryOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      setupObserver();
    });
  } else {
    if (historyObserver.value) historyObserver.value.disconnect();
  }
});

// Close dropdowns when clicking outside
const handleClickOutside = (e) => {
  if (!e.target.closest('.search-bar-container')) {
    isDropdownOpen.value = false;
    isHistoryOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
  if (historyObserver.value) historyObserver.value.disconnect();
});
</script>

<style scoped>
.search-bar-container {
  width: 100%;
  padding: 0 4px;
  position: relative;
  z-index: 50;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  gap: 12px;
  position: relative;
}

.search-icon {
  font-size: 18px;
  color: #666;
  cursor: pointer;
}

.search-input {
  border: none;
  outline: none;
  font-size: 16px;
  flex: 1;
  color: #333;
  min-width: 0;
}

.search-input::placeholder {
  color: #999;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: #eee;
}

/* Dropdown Styles */
.distance-dropdown-container {
  position: relative;
}

.dist-trigger-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
  white-space: nowrap;
}

.dist-trigger-btn:hover {
  background-color: #f5f5f5;
}

.chevron {
  font-size: 10px;
  color: #999;
}

.dist-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  padding: 8px;
  min-width: 140px;
  z-index: 100;
  overflow: hidden;
  border: 1px solid #eee;
}

.dist-option {
  padding: 10px 12px;
  font-size: 14px;
  color: #333;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dist-option:hover {
  background-color: #f8f9fa;
}

.dist-option.active {
  color: #007bff;
  background-color: #e6f2ff;
  font-weight: 600;
}

.dropdown-divider {
  height: 1px;
  background-color: #eee;
  margin: 4px 0;
}

/* Search History Dropdown */
.history-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  padding: 8px 0;
  z-index: 90;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
}

.history-item {
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover {
  background-color: #f8f9fa;
}

.history-text {
  font-size: 15px;
  color: #333;
}

.delete-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 18px;
  padding: 4px;
  cursor: pointer;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  color: #ff3b30;
  background-color: #fff1f0;
  border-radius: 50%;
}

.sentinel {
  height: 10px;
  width: 100%;
}

.empty-history {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>