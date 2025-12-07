<template>
  <div class="sort-wrapper" ref="sortWrapperRef">
    <button class="icon-btn" @click="toggleMenu" title="정렬">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="4" y1="6" x2="20" y2="6" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <line x1="8" y1="10" x2="16" y2="10" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <line x1="4" y1="14" x2="20" y2="14" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <line x1="8" y1="18" x2="16" y2="18" stroke="#333" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
    
    <div v-if="isOpen" class="sort-menu">
      <button 
        class="sort-option" 
        :class="{ active: modelValue === 'desc' }" 
        @click="selectSort('desc')"
      >
        최신순
      </button>
      <button 
        class="sort-option" 
        :class="{ active: modelValue === 'asc' }" 
        @click="selectSort('asc')"
      >
        오래된순
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'desc'
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const sortWrapperRef = ref(null);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const selectSort = (order) => {
  emit('update:modelValue', order);
  isOpen.value = false;
};

const closeMenu = (e) => {
  if (sortWrapperRef.value && !sortWrapperRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeMenu);
});

onUnmounted(() => {
  document.removeEventListener('click', closeMenu);
});
</script>

<style scoped>
.sort-wrapper {
  position: relative;
}

.icon-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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
  white-space: nowrap;
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
