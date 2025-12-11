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
                @update-center="updateMapCenter"
            />
        </div>

        <!-- TopOverlay: Search & Filter -->
        <div class="top-overlay">
            <SearchBar @search="onSearch" />
            <div class="filter-wrapper">
                <CategoryFilter @select-category="updateCategory" />
            </div>
        </div>

        <!-- Toggle Button (Visible when list is closed and has data) -->
        <button v-if="!isListOpen && places.length > 0" class="list-toggle-btn" @click="openSheet">
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
                    ref="placeList"
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
        <ChatModal 
            :lat="currentMapCenter.lat" 
            :lng="currentMapCenter.lng"
            @ai-response="handleAiResponse"
        />
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
};

const updateCategory = (categories) => {
    selectedContentType.value = categories;
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
    currentMapCenter.value = center;
};

const handleAiResponse = (data) => {
    console.log("AI Response received in MainView:", data);
    if (!data || data.length === 0) {
        places.value = [];
        closeSheet();
        return;
    }

    // Update markers on Map
    if (mapComp.value) {
        mapComp.value.setMarkers(data);
    }
    
    // Update local places list (though setMarkers emits update-places, we set it here too to be sure or redundant)
    // MapComponent.setMarkers emits 'update-places', so updatePlaces will be called.
    // places.value = data; // Redundant but safe logic would be rely on event.
    // But since event loop, let's just wait for emit? 
    // Actually mapComp emits updates triggers updatePlaces.

    // Open sheet if closed
    if (!isListOpen.value) {
        // openSheet(); // Optional: User said "button appears", didn't strictly say "open list".
        // "저 데이터가 없으면 Place List(목록보기 버튼)이 없어졌다가, 지도에 마커가 생길때 동시에 버튼이 보이도록해줘"
        // It says "Show the button", not "Open the list".
        // So I will just update data. Button visibility is handled by v-if.
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

.top-overlay > * {
    pointer-events: auto;
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
    box-shadow: 0 -4px 10px rgba(0,0,0,0.1);
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

