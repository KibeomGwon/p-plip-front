<template>
  <div class="carousel-container" :style="{ aspectRatio }">
    <div 
      class="carousel-track" 
      ref="trackRef"
      @scroll="handleScroll"
      @wheel.prevent="onWheel"
    >
      <div 
        v-for="(image, index) in images" 
        :key="index" 
        class="carousel-item"
      >
        <img :src="image" alt="Carousel Image" loading="lazy" />
      </div>
    </div>

    <!-- Indicators -->
    <div v-if="images.length > 1" class="indicators">
      <span 
        v-for="(image, index) in images" 
        :key="index" 
        class="dot"
        :class="{ active: activeIndex === index }"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  aspectRatio: {
    type: String,
    default: '4/3'
  }
});

const activeIndex = ref(0);
const trackRef = ref(null);

const handleScroll = () => {
  if (!trackRef.value) return;
  const { scrollLeft, clientWidth } = trackRef.value;
  activeIndex.value = Math.round(scrollLeft / clientWidth);
};

let wheelTimeout = null;
const onWheel = (e) => {
  if (wheelTimeout) return;
  
  // Basic threshold to ignore small trackpad jitters
  if (Math.abs(e.deltaY) < 10) return;

  const direction = e.deltaY > 0 ? 1 : -1;
  const nextPos = activeIndex.value + direction;

  if (nextPos >= 0 && nextPos < props.images.length) {
    trackRef.value.scrollTo({
      left: nextPos * trackRef.value.clientWidth,
      behavior: 'smooth'
    });
    
    // Cooldown to prevent rapid skipping
    wheelTimeout = setTimeout(() => {
      wheelTimeout = null;
    }, 500);
  }
};
</script>

<style scoped>
.carousel-container {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.carousel-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  width: 100%;
  height: 100%;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  cursor: grab;
}

.carousel-track::-webkit-scrollbar {
  display: none;
}

.carousel-item {
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  scroll-snap-align: center;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.indicators {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 10;
  pointer-events: none;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.3);
  transition: background-color 0.2s;
}

.dot.active {
  background: white;
}
</style>
