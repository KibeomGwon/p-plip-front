<template>
  <div 
    ref="filterContainer"
    class="category-filter"
    @mousedown="startDrag"
    @mousemove="onDrag"
    @mouseup="stopDrag"
    @mouseleave="stopDrag"
  >
    <button 
      v-for="category in categories" 
      :key="category.id"
      class="category-btn"
      :class="{ active: selectedCategories.includes(category.id) }"
      @click="selectCategory(category.id)"
    >
      <span class="icon">{{ category.icon }}</span> {{ category.name }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['select-category']);
const selectedCategories = ref([]); 
const filterContainer = ref(null);
const isDown = ref(false);
const isDragging = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);

const categories = [
  { id: 'RESTAURANT', name: '식당', icon: '🍽️' },
  { id: 'ATTRACTION', name: '관광지', icon: '🗺️' },
  { id: 'ACCOMMODATION', name: '숙박', icon: '🏨' },
  { id: 'SHOPPING', name: '쇼핑', icon: '🛍️' },
  { id: 'CULTURAL_FACILITIES', name: '문화', icon: '🎭' },
  { id: 'LEPORTS', name: '레포츠', icon: '⚽' },
  { id: 'FESTIVAL_PERFORMANCE_EVENT', name: '축제', icon: '🎉' },
  { id: 'TRAVEL_COURSE', name: '여행코스', icon: '🚩' },
];

const selectCategory = (id) => {
  if (isDragging.value) {
    console.log("Category click ignored due to drag");
    return; 
  }
  
  const index = selectedCategories.value.indexOf(id);
  if (index === -1) {
    selectedCategories.value.push(id);
  } else {
    selectedCategories.value.splice(index, 1);
  }
  console.log("Selected categories:", selectedCategories.value);
  
  emit('select-category', [...selectedCategories.value]);
};

const startDrag = (e) => {
  isDown.value = true;
  isDragging.value = false;
  
  if (filterContainer.value) {
    startX.value = e.pageX - filterContainer.value.offsetLeft;
    scrollLeft.value = filterContainer.value.scrollLeft;
  }
};

const onDrag = (e) => {
  if (!isDown.value || !filterContainer.value) return;
  e.preventDefault();
  const x = e.pageX - filterContainer.value.offsetLeft;
  const walk = (x - startX.value) * 2; 
  
  if (Math.abs(x - startX.value) > 5) {
    isDragging.value = true;
    filterContainer.value.scrollLeft = scrollLeft.value - walk;
  }
};

const stopDrag = () => {
  isDown.value = false;
  setTimeout(() => {
    isDragging.value = false;
  }, 50); 
};
</script>

<style scoped>
.category-filter {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 10px 0;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  padding-left: 4px; /* Visual padding */
  padding-right: 4px;
}

.category-filter::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.category-btn:hover {
  background: #f5f5f5;
  border-color: #bbb;
}

.category-btn.active {
  background-color: #333; 
  color: white;
  border-color: #333;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.icon {
  font-size: 16px;
}
</style>
