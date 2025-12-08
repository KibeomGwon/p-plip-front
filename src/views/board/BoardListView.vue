<template>
  <div class="board-view-container">
    <!-- Header -->
    <div class="board-header">
      <h1 class="header-title">여행자들의 수다</h1>
      <button class="search-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Tabs -->
    <div class="board-tabs">
      <router-link 
        :to="{ name: 'freeboard' }" 
        class="tab-item" 
        active-class="active"
      >
        자유게시판
      </router-link>
      <router-link 
        :to="{ name: 'noticeboard' }" 
        class="tab-item" 
        active-class="active"
      >
        공지사항
      </router-link>
    </div>

    <!-- Content -->
    <div class="board-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- Bottom Navigation -->
    <div class="bottom-nav">
      <nav-bar></nav-bar>
    </div>

  </div>
</template>

<script setup>
import NavBar from '@/components/common/Navbar.vue';
</script>

<style scoped>
.board-view-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  touch-action: none; /* Prevent whole page drag */
}

.board-header {
  padding: 20px 20px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.header-title {
  font-size: 24px;
  font-weight: 800;
  color: #333;
  margin: 0;
}

.search-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
}

.board-tabs {
  display: flex;
  padding: 0 20px 10px;
  background: white;
  border-bottom: 1px solid #eee;
  gap: 20px;
}

.tab-item {
  font-size: 16px;
  color: #999;
  text-decoration: none;
  padding-bottom: 8px;
  position: relative;
  font-weight: 600;
}

.tab-item.active {
  color: #333;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px; /* Overlap border */
  left: 0;
  right: 0;
  height: 2px;
  background: #333;
}

.board-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px; /* Space for bottom nav */
  touch-action: pan-y; /* Allow vertical scrolling */
  overscroll-behavior: contain;
}

.board-content::-webkit-scrollbar {
  width: 6px;
  background-color: transparent;
}

.board-content::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 3px;
}

.board-content:hover::-webkit-scrollbar-thumb,
.board-content:active::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  height: calc(60px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 30;
  background: white;
  border-top: 1px solid #eee;
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>