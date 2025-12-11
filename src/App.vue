<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <keep-alive include="MainView">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<style>
body {
  margin: 0;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  min-height: 100vh;
  overscroll-behavior: none; /* Prevent pull-to-refresh/bounce globally */
}

#app {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Custom Scrollbar Global removed to restore native auto-hide behavior */
</style>

<style scoped>
.app-container {
  width: 100%;
  max-width: 430px; /* Mobile width */
  min-height: 100vh;
  background-color: white;
  position: relative;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
  overflow: hidden;
}
</style>
