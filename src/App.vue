<template>
  <div class="app-container">
    <Toast />
    <router-view v-slot="{ Component }">
      <keep-alive include="MainView">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup>
import Toast from '@/components/common/Toast.vue';
</script>

<style>
body {
  margin: 0;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  min-height: 100vh;
  overscroll-behavior: none;
  /* Prevent pull-to-refresh/bounce globally */
}

#app {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Custom Scrollbar Global removed to restore native auto-hide behavior */

/* Global Twinkle Animation */
.twinkle {
  animation: twinkle-glow 1.5s infinite alternate;
}

@keyframes twinkle-glow {
  0% {
    box-shadow: 0 0 5px rgba(33, 150, 243, 0.5);
    color: #2196F3;
  }

  50% {
    box-shadow: 0 0 15px rgba(255, 235, 59, 0.8);
    color: #FFC107;
  }

  100% {
    box-shadow: 0 0 5px rgba(33, 150, 243, 0.5);
    color: #2196F3;
  }
}
</style>

<style scoped>
.app-container {
  width: 100%;
  max-width: 430px;
  /* Mobile width */
  min-height: 100vh;
  background-color: white;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>
