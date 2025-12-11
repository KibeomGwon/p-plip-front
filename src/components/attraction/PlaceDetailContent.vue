<template>
  <div class="bottom-content-wrapper">
    <!-- Image Carousel -->
    <div class="image-carousel">
      <div ref="carouselTrack" class="carousel-track" @scroll="onScroll" @wheel="onWheel">
        <div v-for="(img, index) in place.images" :key="index" class="carousel-item">
          <img :src="img" alt="Place Image" class="place-image" />
        </div>
      </div>
      <!-- Dots indicator -->
      <div v-if="place.images && place.images.length > 1" class="carousel-dots">
        <div 
          v-for="(img, index) in place.images" 
          :key="index" 
          class="dot" 
          :class="{ active: currentImageIndex === index }"
        ></div>
      </div>
    </div>

    <!-- Content Card -->
    <PlaceInfoCard :place="place" />

    <!-- Action Buttons -->
    <PlaceActionButtons v-if="visible" :place="place" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PlaceInfoCard from './PlaceInfoCard.vue';
import PlaceActionButtons from './PlaceActionButtons.vue';

const props = defineProps({
  place: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
      description: '',
      images: [],
      tags: []
    })
  },
  visible: {
    type: Boolean,
    required: true,
    default: true
  }
});

const currentImageIndex = ref(0);

const onScroll = (e) => {
  const scrollLeft = e.target.scrollLeft;
  const width = e.target.clientWidth;
  currentImageIndex.value = Math.round(scrollLeft / width);
};

const carouselTrack = ref(null);
let isScrolling = false;

const scrollToIndex = (index) => {
  if (!carouselTrack.value) return;
  const width = carouselTrack.value.clientWidth;
  carouselTrack.value.scrollTo({
    left: width * index,
    behavior: 'smooth'
  });
};

const onWheel = (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (isScrolling) return;
  
  // Threshold to ignore small accidental scrolls
  if (Math.abs(e.deltaY) < 10) return;

  isScrolling = true;
  
  // Use props.place.images (need to access props)
  const totalImages = props.place.images ? props.place.images.length : 0;
  
  if (e.deltaY > 0) {
    // Scroll down/right -> Next image
    if (currentImageIndex.value < totalImages - 1) {
      scrollToIndex(currentImageIndex.value + 1);
    }
  } else {
    // Scroll up/left -> Prev image
    if (currentImageIndex.value > 0) {
      scrollToIndex(currentImageIndex.value - 1);
    }
  }

  // Cooldown
  setTimeout(() => {
    isScrolling = false;
  }, 500);
};
</script>

<style scoped>
/* Container for content and buttons at the bottom */
.bottom-content-wrapper {
  flex: 1; /* Fill remaining space below header */
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Allow scrolling if content overflows */
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  padding-top: 20px; /* Add space between header and content */
  touch-action: pan-y; /* Allow vertical scrolling */
  overscroll-behavior: contain;
}

.bottom-content-wrapper::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.bottom-content-wrapper::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 3px;
}

.bottom-content-wrapper:hover::-webkit-scrollbar-thumb,
.bottom-content-wrapper:active::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
}

.image-carousel {
  width: 100%;
  position: relative;
  padding: 0 20px 20px;
  box-sizing: border-box;
}

.carousel-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  border-radius: 20px;
  touch-action: pan-x pan-y; /* Allow horizontal scroll and vertical page scroll */
}

.carousel-track::-webkit-scrollbar {
  display: none;
}

.carousel-item {
  flex: 0 0 100%;
  width: 100%;
  height: 45vh; /* Fixed height for the carousel */
  scroll-snap-align: start;
  overflow: hidden;
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.place-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-dots {
  position: absolute;
  bottom: 32px; /* Adjust based on padding */
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
  z-index: 5;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  transition: background 0.2s;
}

.dot.active {
  background: white;
}
</style>
