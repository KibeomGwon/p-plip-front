<template>
  <div class="my-post-list-container">
    <!-- Header -->
    <div class="header">
      <button class="icon-btn back-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h2 class="header-title">내가 쓴 글</h2>
      <SortFilter v-model="sortOrder" />
    </div>

    <!-- Post List -->
    <div class="post-list-wrapper">
      <FreeBoardList filterType="my-posts" :sortOrder="sortOrder" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FreeBoardList from '@/components/board/list/FreeBoardList.vue';
import SortFilter from '@/components/common/SortFilter.vue';

const sortOrder = ref('desc');
</script>

<style scoped>
.my-post-list-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f9f9f9;
  touch-action: none; /* Prevent whole page drag */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #eee;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.header-spacer {
  width: 40px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.post-list-wrapper {
  flex: 1;
  overflow-y: auto;
  touch-action: pan-y; /* Allow vertical scrolling */
  overscroll-behavior: contain;
}
</style>
