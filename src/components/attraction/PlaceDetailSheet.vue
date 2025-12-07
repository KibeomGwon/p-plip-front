<template>
  <div class="modal-content" @click.stop>
    <div class="modal-header">
      <button class="close-btn" @click="$emit('close')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <div class="modal-body">
      <PlaceDetailContent :place="place" :visible="false"/>
    </div>
  </div>
</template>

<script setup>
import PlaceDetailContent from './PlaceDetailContent.vue';

defineProps({
  place: {
    type: Object,
    required: true
  }
});

defineEmits(['close']);
</script>

<style scoped>
.modal-content {
  width: 100%;
  max-width: 360px; /* Limit width for centered modal */
  height: auto;
  max-height: 85vh; /* Limit height */
  background-color: white;
  border-radius: 24px; /* Rounded corners on all sides */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleUp 0.3s ease-out;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  touch-action: pan-y; /* Allow scrolling inside the modal */
}

.modal-header {
  padding: 16px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  flex: 1;
  overflow-y: auto; /* Allow internal scrolling */
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
}

@keyframes scaleUp {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
