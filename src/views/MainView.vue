<template>
    <div class="main-container">
        <!-- Map Background -->
        <div class="map-background">
            <MapComponent 
                ref="mapComp" 
                :contentType="selectedContentType"
                :searchQuery="searchQuery"
                :searchRadius="searchRadius"
                @update-places="updatePlaces" 
                @update-loading="updateLoading"
                @reset-list="onResetList"
            />
        </div>

        <!-- Top Overlay: Search & Filter -->
        <div class="top-overlay">
            <SearchBar @search="onSearch" />
            <div class="filter-wrapper">
                <CategoryFilter @select-category="updateCategory" />
            </div>
        </div>

        <!-- Toggle Button (Visible when list is closed) -->
        <button v-if="!isListOpen" class="list-toggle-btn" @click="openSheet">
            목록 보기
        </button>

        <!-- Bottom Sheet: Place List -->
        <div 
            class="bottom-sheet" 
            :class="{ 'closed': !isListOpen }"
            :style="{ height: sheetHeight + 'px' }"
        >
            <div 
                class="sheet-handle-bar"
                @mousedown="startDrag"
                @touchstart="startDrag"
            >
                <div class="sheet-handle"></div>
            </div>
            <div class="sheet-content">
                <PlaceList 
                    :places="places" 
                    @close="closeSheet" 
                    @load-more="fetchNextPage"
                    @move-map="moveMapToPlace"
                />
            </div>
        </div>

        <!-- Bottom Navigation -->
        <div class="bottom-nav">
            <nav-bar></nav-bar>
        </div>

        <!-- Chat Modal -->
        <ChatModal />
    </div>
</template>

<script>
export default {
    name: 'MainView'
}
</script>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import MapComponent from '@/components/main/Mapcomponent.vue';
import SearchBar from '@/components/main/SearchBar.vue';
import CategoryFilter from '@/components/main/CategoryFilter.vue';
import PlaceList from '@/components/main/PlaceList.vue';
import NavBar from '@/components/common/Navbar.vue';
import ChatModal from '@/components/common/ChatModal.vue';

import { attractionApi } from '@/api/attraction';

const isListOpen = ref(false);
const sheetHeight = ref(window.innerHeight * 0.6); // Initial height 60%
const mapComp = ref(null);
const placeList = ref(null); // Ref for PlaceList component
const places = ref([]);
const selectedContentType = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const searchRadius = ref(0); // Default 0 (Use dynamic zoom initially)

const onSearch = ({ query, dist }) => {
    console.log(`MainView: Search triggered. Query: "${query}", Dist: ${dist}km`);
    searchQuery.value = query;
    if (dist === -1) {
        searchRadius.value = 20000000; // 20,000 km (Earth half-circumference approx) - effectively unlimited
    } else {
        searchRadius.value = dist * 1000;
    }
};

const updateCategory = (categories) => {
    console.log('MainView: Categories selected:', categories);
    selectedContentType.value = categories;
};

const updatePlaces = (newPlaces) => {
    console.log('MainView received places:', newPlaces.length);
    places.value = newPlaces;
};

const updateLoading = (loading) => {
    isLoading.value = loading;
};

const onResetList = () => {
    console.log('MainView: Resetting place list scroll');
    places.value = []; // Clear data immediately
    if (placeList.value) {
        placeList.value.resetList();
    }
};

const fetchNextPage = () => {
    console.log("MainView: fetchNextPage triggered. MapComp ref present?", !!mapComp.value);
    if (mapComp.value) {
        mapComp.value.loadMore();
    }
};

const moveMapToPlace = (place) => {
    if (mapComp.value) {
        mapComp.value.moveToLocation(place.latitude, place.longitude);
        // Optional: Close sheet partially to show map?
        // sheetHeight.value = window.innerHeight * 0.3; 
    }
};

// Drag Logic
const isDragging = ref(false);
const startY = ref(0);
const startHeight = ref(0);
const startTime = ref(0);
const isClick = ref(false);

const openSheet = () => {
    isListOpen.value = true;
    // Set default height at 60%
    sheetHeight.value = window.innerHeight * 0.6;
};

const closeSheet = () => {
    isListOpen.value = false;
};

const startDrag = (e) => {
    isDragging.value = true;
    isClick.value = true; // Assume click initially
    startTime.value = Date.now();
    startY.value = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    startHeight.value = sheetHeight.value;

    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', onDrag);
    window.addEventListener('touchend', stopDrag);
};

const onDrag = (e) => {
    if (!isDragging.value) return;
    
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    const deltaY = startY.value - clientY; 
    
    // If moved more than 5px, it's a drag, not a click
    if (Math.abs(deltaY) > 5) {
        isClick.value = false;
    }

    if (!isClick.value) {
        // Drag Logic
        const newHeight = startHeight.value + deltaY;
        const maxHeight = window.innerHeight - 100;
        
        // Allow resizing, but minimum reasonable height
        if (newHeight >= 100 && newHeight <= maxHeight) {
             sheetHeight.value = newHeight;
        }
    }
};

const stopDrag = () => {
    isDragging.value = false;
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', stopDrag);
    window.removeEventListener('touchmove', onDrag);
    window.removeEventListener('touchend', stopDrag);

    // If it was a click, close the sheet
    const duration = Date.now() - startTime.value;
    if (isClick.value && duration < 300) {
        closeSheet();
        return;
    }

    // Close if height is less than 25% of screen
    if (sheetHeight.value < window.innerHeight * 0.25) {
        closeSheet();
    }
};
</script>

<style scoped>
.main-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background-color: #f5f5f5;
    overscroll-behavior: none; /* Prevent pull-to-refresh/bounce */
    touch-action: none; /* Prevent default touch actions like scrolling the whole page */
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
    /* height is controlled by inline style */
    z-index: 20;
    border-radius: 20px 20px 0 0;
    overflow: hidden;
    transition: transform 0.3s ease-in-out;
    background: white;
    display: flex;
    flex-direction: column;
    box-shadow: 0 -4px 10px rgba(0,0,0,0.1);
}

.bottom-sheet.closed {
    transform: translateY(110%); /* Move completely out including shadow */
}

.sheet-handle-bar {
    width: 100%;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    cursor: grab;
    background: white;
}

.sheet-handle-bar:active {
    cursor: grabbing;
}

.sheet-handle-bar:active .sheet-handle {
    background-color: #3b82f6;
}

.sheet-handle {
    width: 40px;
    height: 4px;
    background-color: #e0e0e0;
    border-radius: 2px;
    transition: background-color 0.2s;
}

.sheet-content {
    flex: 1;
    overflow: hidden;
    position: relative;
}

/* Deep selector to override PlaceList default styles to fit perfectly */
:deep(.place-list-container) {
    box-shadow: none !important;
    border-radius: 0 !important;
    height: 100% !important;
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
</style>
