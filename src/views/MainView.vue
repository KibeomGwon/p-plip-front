<template>
    <div class="main-container">
        <!-- Map Background -->
        <div class="map-background">
            <MapComponent ref="mapComp" :contentType="selectedContentType" :searchQuery="searchQuery"
                :searchRadius="searchRadius" @update-places="updatePlaces" @update-loading="updateLoading"
                @reset-list="onResetList" @update-center="updateMapCenter" />
        </div>

        <!-- TopOverlay: Search & Filter -->
        <div class="top-overlay">
            <SearchBar @search="onSearch" />
            <div class="filter-row">
                <div class="filter-wrapper">
                    <CategoryFilter @select-category="updateCategory" />
                </div>
            </div>
        </div>

        <!-- Clear Map Button (Bottom Left, Symmetric to ChatFab) -->
        <button class="clear-map-btn" @click="onClearMap" title="지도 지우기">
            <!-- Eraser SVG Icon -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M15.1186 3.00344C15.9329 2.18907 17.2533 2.18907 18.0676 3.00344L20.9964 5.93223C21.8108 6.7466 21.8108 8.06704 20.9964 8.88141L11.558 18.3198C11.5165 18.3614 11.4673 18.3944 11.4132 18.4168L7.87868 19.8814C7.45263 20.058 6.96984 19.8971 6.75736 19.5L6.38699 18.8077L4.69239 20.5023C4.30186 20.8929 3.6687 20.8929 3.27817 20.5023C2.88765 20.1118 2.88765 19.4786 3.27817 19.0881L4.97277 17.3935L4.5 16.5103C4.28751 16.1132 4.45934 15.6179 4.88141 15.4213L6.346 11.8868C6.36845 11.8327 6.40141 11.7835 6.44299 11.7419L15.1186 3.00344ZM16.5932 4.47805L7.91761 13.1537L7.2005 14.8841L9.11579 16.7994L10.8462 16.0823L19.5218 7.40669L16.5932 4.47805Z"
                    fill="#3b82f6" />
            </svg>
        </button>

        <!-- My Location Button (Bottom Right, above ChatFab) -->
        <button class="my-location-btn" @click="handleResetLocation" title="내 위치로">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" stroke="#3b82f6"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="12" cy="12" r="3" fill="#3b82f6" />
            </svg>
        </button>

        <!-- Toggle Button (Visible when list is closed and has data) -->
        <button v-if="!isListOpen && places.length > 0" class="list-toggle-btn" @click="openSheet">
            목록 보기
        </button>

        <!-- Bottom Sheet: Place List -->
        <div class="bottom-sheet" :class="{ 'closed': !isListOpen }" :style="{ height: sheetHeight + 'px' }">
            <div class="sheet-handle-bar" @mousedown="startDrag" @touchstart="startDrag">
                <div class="sheet-handle"></div>
            </div>
            <div class="sheet-content">
                <PlaceList ref="placeList" :places="places" @close="closeSheet" @load-more="fetchNextPage"
                    @move-map="moveMapToPlace" />
            </div>
        </div>

        <!-- Bottom Navigation -->
        <div class="bottom-nav">
            <nav-bar></nav-bar>
        </div>

        <!-- Chat Modal -->
        <ChatModal :lat="currentMapCenter.lat" :lng="currentMapCenter.lng" @ai-response="handleAiResponse" />
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

// No direct import needed for attractionApi here if using MapComponent's logic, 
// but used for tracking logic if needed.

const isListOpen = ref(false);
const sheetHeight = ref(window.innerHeight * 0.6); // Initial height 60%
const mapComp = ref(null);
const placeList = ref(null);
const places = ref([]);
const selectedContentType = ref([]);
const pendingContentType = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const searchRadius = ref(0);

const currentMapCenter = ref({ lat: 33.450701, lng: 126.570667 });

const onSearch = ({ query, dist }) => {
    console.log(`MainView: Search triggered. Query: "${query}", Dist: ${dist}km`);
    searchQuery.value = query;
    if (dist === -1) {
        searchRadius.value = 20000000;
    } else {
        searchRadius.value = dist * 1000;
    }

    // Commit pending categories to trigger search
    selectedContentType.value = [...pendingContentType.value];

    // Force refresh if needed
    if (mapComp.value && mapComp.value.refreshMap) {
        // Using refreshMap to ensure search happens even if params didn't technically change
        // (though setting selectedContentType usually triggers it)
        // But since we want "Search Button -> Search", explicit is better if no change.
        // However, MapComponent watcher is reliable.
    }
};

const updateCategory = (categories) => {
    pendingContentType.value = categories;

    // If user deselects all, clear map immediately (User Request 2)
    if (categories.length === 0) {
        console.log("MainView: All categories deselected. Clearing map.");
        if (mapComp.value) {
            mapComp.value.setMarkers([]);
        }
        places.value = [];
        closeSheet();
        // Removed selectedContentType.value = []; to prevent API auto-fetch
    }
};

const onClearMap = () => {
    if (mapComp.value) {
        mapComp.value.setMarkers([]);
    }
    places.value = [];
    closeSheet();
};

const handleResetLocation = () => {
    if (mapComp.value) {
        mapComp.value.resetToCurrentLocation();
    }
};

const updatePlaces = (newPlaces) => {
    places.value = newPlaces;
};

const updateLoading = (loading) => {
    isLoading.value = loading;
};

const onResetList = () => {
    places.value = [];
    if (placeList.value) {
        placeList.value.resetList();
    }
};

const updateMapCenter = (center) => {
    console.log("MainView: updateMapCenter", center);
    currentMapCenter.value = center;
};

const handleAiResponse = (data) => {
    console.log("MainView: handleAiResponse called", data);
    if (!data || data.length === 0) {
        console.warn("MainView: No data received or empty array");
        places.value = [];
        closeSheet();
        return;
    }

    // Update places immediately to ensure list works even if map has issues
    places.value = data;
    console.log("MainView: Updated places locally. Count:", places.value.length);

    // Update markers on Map
    if (mapComp.value) {
        console.log("MainView: Calling mapComp.setMarkers");
        mapComp.value.setMarkers(data);
    } else {
        console.error("MainView: mapComp ref is null!");
    }

    // Open sheet if closed
    if (!isListOpen.value && places.value.length > 0) {
        // Optional: Auto open? or just show button?
        // User asked to "Show the button". Button shows via v-if="!isListOpen && places.length > 0"
        // So just updating places is enough.
        console.log("MainView: List button should appear now.");
    }
};

const fetchNextPage = () => {
    if (mapComp.value) {
        mapComp.value.loadMore();
    }
};

const moveMapToPlace = (place) => {
    if (mapComp.value) {
        mapComp.value.moveToLocation(place.latitude, place.longitude);
    }
};

// Drag Logic provided by existing code
const isDragging = ref(false);
const startY = ref(0);
const startHeight = ref(0);
const startTime = ref(0);
const isClick = ref(false);

const openSheet = () => {
    isListOpen.value = true;
    sheetHeight.value = window.innerHeight * 0.6;
};

const closeSheet = () => {
    isListOpen.value = false;
};

const startDrag = (e) => {
    isDragging.value = true;
    isClick.value = true;
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

    if (Math.abs(deltaY) > 5) {
        isClick.value = false;
    }

    if (!isClick.value) {
        const newHeight = startHeight.value + deltaY;
        const maxHeight = window.innerHeight - 100;

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

    const duration = Date.now() - startTime.value;
    if (isClick.value && duration < 300) {
        closeSheet();
        return;
    }

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
    overscroll-behavior: none;
    touch-action: none;
}

.map-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
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
    pointer-events: none;
}

.top-overlay>* {
    pointer-events: auto;
}

.filter-wrapper {
    flex: 1;
    overflow: hidden;
}

.filter-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.clear-map-btn {
    position: absolute;
    bottom: calc(80px + env(safe-area-inset-bottom));
    left: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: white;
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 90;
    cursor: pointer;
    transition: transform 0.2s, background-color 0.2s;
}

.clear-map-btn:active {
    transform: scale(0.95);
    background-color: #f5f5f5;
}

.my-location-btn {
    position: absolute;
    bottom: calc(150px + env(safe-area-inset-bottom));
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: white;
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 90;
    cursor: pointer;
    transition: transform 0.2s, background-color 0.2s;
}

.my-location-btn:active {
    transform: scale(0.95);
    background-color: #f5f5f5;
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
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    font-weight: bold;
    color: #333;
    cursor: pointer;
}

.bottom-sheet {
    position: absolute;
    bottom: calc(60px + env(safe-area-inset-bottom));
    left: 0;
    right: 0;
    z-index: 20;
    border-radius: 20px 20px 0 0;
    overflow: hidden;
    transition: transform 0.3s ease-in-out;
    background: white;
    display: flex;
    flex-direction: column;
    box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
}

.bottom-sheet.closed {
    transform: translateY(110%);
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
