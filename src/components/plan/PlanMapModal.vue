<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3>지도 보기</h3>
        
        <!-- Day Tabs - Only show if more than 1 day -->
        <div class="map-date-tabs" v-if="uniqueDates.length > 1">
           <button class="map-tab-btn" :class="{ active: selectedDate === 'all' }" @click="selectedDate = 'all'">
             전체
           </button>
           <button v-for="(date, index) in uniqueDates" :key="date" 
             class="map-tab-btn" :class="{ active: selectedDate === date }" @click="selectedDate = date">
             Day {{ index + 1 }}
           </button>
        </div>

        <button class="close-btn" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="map-wrapper">
        <PlanMap ref="mapComp" :markers="mapMarkers" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import PlanMap from '@/components/plan/PlanMap.vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  },
  todoList: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close']);

const mapComp = ref(null);
const selectedDate = ref('all');

const closeModal = () => {
  emit('close');
  selectedDate.value = 'all'; // Reset on close
};

const uniqueDates = computed(() => {
  const dates = new Set(props.todoList.map(item => {
    if(!item.startAt) return null;
    return item.startAt.split('T')[0];
  }).filter(d => d));
  return Array.from(dates).sort();
});

const mapMarkers = computed(() => {
  let list = props.todoList;
  
  if (selectedDate.value !== 'all') {
    list = list.filter(item => item.startAt && item.startAt.startsWith(selectedDate.value));
  }

  return list
    .filter(item => item.latitude && item.longitude)
    .map(item => ({
      no: item.attractionId || item.id,
      title: item.title,
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
      image: item.image 
    }));
});

// Reset selection when modal opens or list changes
watch(() => props.isVisible, (val) => {
  if (val) {
    selectedDate.value = 'all';
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-container {
  width: 100%;
  max-width: 800px;
  height: 80vh;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.modal-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap; /* Allow wrapping on small screens */
  gap: 12px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  margin-right: auto; /* Push content */
}

.map-date-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.map-date-tabs::-webkit-scrollbar {
  display: none;
}

.map-tab-btn {
  background: #f1f1f1;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.map-tab-btn.active {
  background: #0095f6;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
}

.map-wrapper {
  flex: 1;
  position: relative;
}
</style>
