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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['search']);

const searchQuery = ref('');
const searchDist = ref(1); // Default 1km
const isNoLimit = ref(false);
const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
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
  emit('search', {
    query: searchQuery.value,
    dist: isNoLimit.value ? -1 : searchDist.value
  });
};

// Close dropdown when clicking outside
const closeDropdown = (e) => {
  if (!e.target.closest('.distance-dropdown-container')) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown);
});
</script>

<style scoped>
.search-bar-container {
  width: 100%;
  padding: 0 4px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  gap: 12px;
  position: relative; /* For dropdown positioning context if needed, but wrapper is better */
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
  min-width: 0; /* Allow shrinking */
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
</style>