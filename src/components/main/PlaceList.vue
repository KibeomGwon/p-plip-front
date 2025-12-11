<template>
  <div 
    ref="listContainer"
    class="place-list-container" 
  >
    <div class="place-list-header">
      <h2 class="section-title">주변 추천 장소</h2>
    </div>
    
    <div class="place-list" ref="scrollContainer">
      <div v-for="place in visiblePlaces" :key="place.no" class="place-card" @click="onCardClick(place)">
        <div class="place-image" :style="{ backgroundImage: `url(${place.firstImage1 || place.firstImage2 || 'https://via.placeholder.com/80'})` }"></div>
        <div class="place-info">
          <h3 class="place-name">{{ place.title }}</h3>
          <p class="place-desc">{{ place.addr1 || place.addr2 || '주소 정보 없음' }}</p>
          <button class="detail-btn" @click.stop="goToDetail(place.no)">자세히 보기</button>
        </div>
      </div>
      <!-- Loading Indicator -->
      <div v-if="isLoading" class="loading-indicator">
        <div class="spinner"></div>
      </div>
      <!-- Sentinel for Infinite Scroll -->
      <div ref="sentinel" class="sentinel"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  places: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

import { computed, watch, nextTick } from 'vue';

const router = useRouter();
const emit = defineEmits(['close', 'load-more', 'move-map']);
// ... (rest is same)

// In template:
/*
      <div v-if="isLoading" class="loading-indicator">
        <div class="spinner"></div> Loading...
      </div>
*/

const listContainer = ref(null);
const sentinel = ref(null);
let observer = null;
const visibleCount = ref(10);
const visiblePlaces = computed(() => {
  return props.places.slice(0, visibleCount.value);
});

const resetList = () => {
  visibleCount.value = 10;
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0;
  }
};

defineExpose({ resetList });

// Removed automatic watcher to prevent unwanted resets on partial data updates.
// Reset is now manually triggered via parent.

const goToDetail = (id) => {
  router.push({ name: 'place-detail', params: { id } });
};

const onCardClick = (place) => {
  emit('move-map', place);
};

const scrollContainer = ref(null);
const isIntersecting = ref(false);

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    isIntersecting.value = entries[0].isIntersecting;
    if (isIntersecting.value) {
      processInfiniteScroll();
    }
  }, {
    root: scrollContainer.value,
    rootMargin: '200px',
    threshold: 0.1
  });

  if (sentinel.value) {
    observer.observe(sentinel.value);
  }
});

const processInfiniteScroll = async () => {
  if (props.isLoading) return;

  if (visibleCount.value < props.places.length) {
    // Load local data
    visibleCount.value += 20;
    
    // Check if we need to load MORE immediately
    await nextTick();
    if (!sentinel.value || !scrollContainer.value) return;

    const sentinelRect = sentinel.value.getBoundingClientRect();
    const containerRect = scrollContainer.value.getBoundingClientRect();

    // If sentinel is still within view (with buffer), load more
    if (sentinelRect.top < containerRect.bottom + 200) {
      processInfiniteScroll();
    }
  } else {
    emit('load-more');
  }
};

watch(() => props.isLoading, (newVal) => {
  if (!newVal) {
    nextTick(() => {
       if (sentinel.value && scrollContainer.value) {
         const sentinelRect = sentinel.value.getBoundingClientRect();
         const containerRect = scrollContainer.value.getBoundingClientRect();
         if (sentinelRect.top < containerRect.bottom + 200) {
           processInfiniteScroll();
         }
       }
    });
  }
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<style scoped>
.place-list-container {
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 20px 20px 0 20px; /* Remove bottom padding from container */
  box-shadow: 0 -4px 10px rgba(0,0,0,0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.place-list-header {
  flex-shrink: 0;
}

.place-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px; /* Space for NavBar */
  touch-action: pan-y; /* Allow vertical scrolling */
  overscroll-behavior: contain; /* Prevent scroll chaining to parent */
}

.sentinel {
  height: 20px;
  width: 100%;
  border: 1px solid transparent; /* Ensure it takes space */
}

.place-list::-webkit-scrollbar {
  width: 4px;
}

.place-list::-webkit-scrollbar-track {
  background: transparent;
}

.place-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.close-btn {
  display: block;
  width: 100%;
  padding: 10px 0;
  background: transparent;
  border: none;
  font-size: 14px;
  color: #999;
  cursor: pointer;
  margin-bottom: 10px;
}

.close-btn:hover {
  color: #666;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #333;
}

.place-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.place-card {
  display: flex;
  gap: 16px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 16px;
  align-items: center;
}

.place-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-color: #ddd;
  flex-shrink: 0;
}

.place-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.place-name {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #333;
}

.place-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 8px;
  line-height: 1.4;
}

.detail-btn {
  align-self: flex-end;
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.detail-btn:hover {
  background: #0056b3;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  padding: 20px;
  width: 100%;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
