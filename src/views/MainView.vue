<template>
    <div class="main-container">
        <!-- Map Background -->
        <div class="map-background">
            <MapComponent />
        </div>

        <!-- Top Overlay: Search & Filter -->
        <div class="top-overlay">
            <SearchBar />
            <div class="filter-wrapper">
                <CategoryFilter />
            </div>
        </div>

        <!-- Toggle Button (Visible when list is closed) -->
        <button v-if="!isListOpen" class="list-toggle-btn" @click="isListOpen = true">
            목록 보기
        </button>

        <!-- Bottom Sheet: Place List -->
        <div class="bottom-sheet" :class="{ 'closed': !isListOpen }">
            <PlaceList @close="isListOpen = false" />
        </div>

        <!-- Bottom Navigation -->
        <div class="bottom-nav">
            <nav-bar></nav-bar>
        </div>

        <!-- Chat Modal -->
        <ChatModal />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import MapComponent from '@/components/main/Mapcomponent.vue';
import SearchBar from '@/components/main/SearchBar.vue';
import CategoryFilter from '@/components/main/CategoryFilter.vue';
import PlaceList from '@/components/main/PlaceList.vue';
import NavBar from '@/components/common/Navbar.vue';
import ChatModal from '@/components/common/ChatModal.vue';

const isListOpen = ref(false);
</script>

<style scoped>
.main-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background-color: #f5f5f5;
}

.map-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%; /* Full height */
    z-index: 1;
}

.top-overlay {
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none; /* Allow clicks to pass through to map where not clicking children */
}

.top-overlay > * {
    pointer-events: auto; /* Re-enable pointer events for children */
}

.filter-wrapper {
    width: 100%;
    overflow: hidden;
}

.list-toggle-btn {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 25;
    padding: 10px 20px;
    background: white;
    border: none;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    font-weight: bold;
    color: #333;
    cursor: pointer;
}

.bottom-sheet {
    position: absolute;
    bottom: calc(60px + env(safe-area-inset-bottom)); /* Height of NavBar + safe area */
    left: 0;
    right: 0;
    height: 55%;
    z-index: 20;
    border-radius: 20px 20px 0 0;
    overflow: hidden;
    transition: transform 0.3s ease-in-out;
}

.bottom-sheet.closed {
    transform: translateY(100%);
}

.bottom-nav {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: calc(60px + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    z-index: 30;
    background: white;
    border-top: 1px solid #eee;
}
</style>
