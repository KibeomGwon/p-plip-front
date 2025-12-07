<template>
  <div class="app-header" :class="{ 'is-sticky': sticky }">
    <div class="header-left">
      <button v-if="hasBack" class="icon-btn back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <slot name="left"></slot>
    </div>
    
    <h2 class="header-title">
      <slot name="title">{{ title }}</slot>
    </h2>

    <div class="header-right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  hasBack: {
    type: Boolean,
    default: true
  },
  sticky: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['back']);
const router = useRouter();

const goBack = () => {
  if (props.hasBack) {
    emit('back'); // Allow parent to override or handle side effects
    router.back();
  }
};
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid rgba(0,0,0,0.05); /* Default subtle border */
  z-index: 100;
  width: 100%;
  box-sizing: border-box;
}

.app-header.is-sticky {
  position: sticky;
  top: 0;
}

.header-left, .header-right {
  min-width: 40px; /* Balance the layout */
  display: flex;
  align-items: center;
}

.header-right {
  justify-content: flex-end;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
  text-align: center;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -8px; /* Alignment correction */
}
</style>
