<template>
    <div class="main-container">
        <!-- Map Background -->
        <div class="map-background">
            <MapComponent ref="mapComp" :contentType="selectedContentType" :searchQuery="searchQuery"
                :searchRadius="searchRadius" :initialFetch="shouldInitialFetch" @update-places="updatePlaces" @update-loading="updateLoading"
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
            <!-- Eraser SVG Icon -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M7 21L2.7 16.7C1.7 15.7 1.7 14.2 2.7 13.3L12.3 3.7C13.3 2.7 14.8 2.7 15.8 3.7L21.4 9.3C22.4 10.3 22.4 11.8 21.4 12.7L13 21">
                </path>
                <path d="M22 21H7"></path>
                <path d="M5 11L14 20"></path>
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
    name: 'AttractionMapView'
}
</script>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import MapComponent from '@/components/main/Mapcomponent.vue';
import SearchBar from '@/components/main/SearchBar.vue';
import CategoryFilter from '@/components/main/CategoryFilter.vue';
import PlaceList from '@/components/main/PlaceList.vue';
import NavBar from '@/components/common/Navbar.vue';
import ChatModal from '@/components/common/ChatModal.vue';
import { storeToRefs } from 'pinia';
import { useLocationStore } from '@/stores/location';

const locationStore = useLocationStore();

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

const { aiSearchResults } = storeToRefs(locationStore);
const shouldInitialFetch = computed(() => {
    // If we have AI results to restore, SKIP initial fetch in MapComponent
    return !(aiSearchResults.value && aiSearchResults.value.length > 0);
});

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
    locationStore.removeAiSearchResults();
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
    locationStore.removeAiSearchResults();
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
    locationStore.removeAiSearchResults();
    if (!data || data.length === 0) {
        console.warn("MainView: No data received or empty array");
        places.value = [];
        closeSheet();
        return;
    }

    // Update places immediately to ensure list works even if map has issues
    // Update places immediately to ensure list works even if map has issues
    // Ensure data has correct property names for MapComponent
    if (data.length > 0) {
        console.log("AI Response First Item Keys:", Object.keys(data[0]));
        console.log("AI Response First Item:", data[0]);
    }

    const formattedData = data.map(item => ({
        ...item,
        // Map common mismatches if necessary. Try multiple common keys.
        contentType: Number(item.contentType || item.content_type || item.contentTypeId || item.type || 12), 
        latitude: Number(item.latitude || item.mapy || item.lat),
        longitude: Number(item.longitude || item.mapx || item.lng)
    }));

    places.value = formattedData;
    console.log("MainView: Updated places locally. Count:", places.value.length);
    
    // Persist to store (User Request)
    // Persist to store (User Request)
    locationStore.setAiSearchResults(formattedData);

    // Update markers on Map
    if (mapComp.value) {
        console.log("MainView: Calling mapComp.setMarkers");
        mapComp.value.setMarkers(formattedData);
        // Fit bounds to show all markers (User Request)
        mapComp.value.fitBoundsToMarkers(formattedData);
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



onMounted(() => {
    // Restore AI results if available
    if (aiSearchResults.value && aiSearchResults.value.length > 0) {
        console.log("Restoring AI search results from store...");
        places.value = aiSearchResults.value;
        // Wait for map to be ready? MapComponent handles setMarkers via ref, checking if ref exists provided complication.
        // MapComponent uses onLoadKakaoMap to set mapRef.
        // If map is not ready yet, we can't set markers.
        // However, MapComponent exposes 'setMarkers' which modifies a ref 'markerList'.
        // So if we call setMarkers, it updates the list, and v-for renders CustomOverlays.
        // This works Reactively even if map isn't fully "loaded" (just needs to exist in DOM).
        // But mapComp ref might be null on mount of PARENT? No, child mounts before parent mounted?
        // No, parent mounted -> child mounted.
        // Wait, onMounted is called after child is mounted?
        // Actually, we should probably watch mapComp or just try/wait.
        // But better: Use a watcher or try in nextTick?
        
        // Actually, since this is setup script, onMounted runs after child components mounted? 
        // Child's onMounted runs before Parent's onMounted.
        // So mapComp ref should be available.
        setTimeout(() => { // Small delay to be safe
             if (mapComp.value) {
                mapComp.value.setMarkers(places.value);
                mapComp.value.fitBoundsToMarkers(places.value);
             }
        }, 100);
    }
});

onBeforeRouteLeave((to, from, next) => {
    // If not going to detail view, clear the saved AI results
    if (to.name !== 'place-detail') {
        console.log("Leaving map view (not to detail), clearing AI results");
        locationStore.removeAiSearchResults();
    }
    next();
});

const fetchNextPage = () => {
    if (mapComp.value) {
        mapComp.value.loadMore();
    }
};

const moveMapToPlace = (place) => {
    if (mapComp.value) {
        mapComp.value.moveToLocation(place.latitude, place.longitude, 2);
    }
    closeSheet();
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
