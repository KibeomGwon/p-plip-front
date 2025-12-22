<template>
  <div class="map-search-view">
    <!-- Map (Full Screen) -->
    <div class="map-area">
      <KakaoMap 
        ref="mapRef"
        :lat="center.lat" 
        :lng="center.lng" 
        width="100%" 
        height="100%"
        @onLoadKakaoMap="onLoadKakaoMap"
      >
        <!-- Existing Plan Markers -->
        <KakaoMapCustomOverlay 
          v-for="(item, index) in existingPlanItems" 
          :key="'existing-' + index"
          :lat="Number(item.latitude)"
          :lng="Number(item.longitude)"
          :yAnchor="1"
        >
          <div class="map-marker existing">
            <div class="marker-pin">{{ index + 1 }}</div>
            <div class="marker-label">{{ item.title }}</div>
          </div>
        </KakaoMapCustomOverlay>

        <!-- Search Result Markers -->
        <!-- Search Result Markers -->
        <!-- Search Result Markers -->
        <KakaoMapCustomOverlay
          v-for="(place, index) in results" 
          :key="getPlaceId(place) || index"
          :lat="Number(place.latitude)"
          :lng="Number(place.longitude)"
          :yAnchor="1"
          :zIndex="10"
        >
            <div class="custom-marker-wrapper" @click.stop="selectPlace(place)">
                <img class="custom-marker-image" :class="{ 
                    'shopping-marker': Number(place.contentTypeId) === 38 || Number(place.contentType) === 38,
                    'festival-marker': Number(place.contentTypeId) === 15 || Number(place.contentType) === 15,
                    'food-marker': Number(place.contentTypeId) === 39 || Number(place.contentType) === 39
                }" :src="getCategoryMarker(place.contentTypeId || place.contentType)" alt="marker" />
            </div>
        </KakaoMapCustomOverlay>



        <!-- Current Location Marker -->
        <KakaoMapMarker 
          v-if="userLocation"
          :lat="userLocation.lat" 
          :lng="userLocation.lng"
          :image="{
            imageSrc: markerCurrent,
            imageWidth: 40,
            imageHeight: 40
          }"
        />

      </KakaoMap>
    </div>

    <!-- Floating Search Container -->
    <div class="floating-search-container">
      <div class="search-header-card">
        <div class="header-row">
            <button class="back-btn" @click="goBack">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5"></path>
                <path d="M12 19L5 12L12 5"></path>
            </svg>
            </button>
            
            <CategoryFilter @select-category="onSelectCategory" />
        </div>
      </div>


    </div>

    <!-- Clear Map Button (Bottom Left) -->
    <!-- Clear Map Button (Bottom Left) -->
    <button v-if="results.length > 0" class="clear-map-btn" @click="clearMap" title="지도 정리">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 21L2.7 16.7C1.7 15.7 1.7 14.2 2.7 13.3L12.3 3.7C13.3 2.7 14.8 2.7 15.8 3.7L21.4 9.3C22.4 10.3 22.4 11.8 21.4 12.7L13 21"></path>
            <path d="M22 21H7"></path>
            <path d="M5 11L14 20"></path>
        </svg>
    </button>

    <!-- Load More Button -->
    <div class="load-more-container" v-if="hasSearched && hasMore && results.length > 0">
        <button class="load-more-btn" @click="loadMore" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-small"></span>
            <span v-else>+ 더보기</span>
        </button>
    </div>

    <!-- Place Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedPlace" class="modal-overlay" @click.self="selectedPlace = null">
         <div class="place-card-wrapper">
             <PlaceDetailSheet 
                :place="selectedPlace"
                :hide-actions="true" 
                @close="selectedPlace = null"
             >
                <template #footer>
                    <button class="custom-add-btn" @click="addToPlan(selectedPlace)">
                        + 내 계획에 추가하기
                    </button>
                </template>
             </PlaceDetailSheet>
         </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { KakaoMap, KakaoMapCustomOverlay, KakaoMapMarker } from 'vue3-kakao-maps';
import { attractionApi } from '@/axios/attraction';
import { usePlanStore } from '@/stores/plan';
import { useLocationStore } from '@/stores/location';
import { storeToRefs } from 'pinia';
import CategoryFilter from '@/components/main/CategoryFilter.vue';
import PlaceDetailSheet from '@/components/attraction/PlaceDetailSheet.vue';

import markerAttraction from '@/assets/markers/marker_attraction.png'
import markerCulture from '@/assets/markers/marker_culture.png'
import markerFood from '@/assets/markers/marker_food.png'
import markerAccommodation from '@/assets/markers/marker_accommodation.png'
import markerShopping from '@/assets/markers/marker_shopping.png'
import markerLeports from '@/assets/markers/marker_leports.png'
import markerFestival from '@/assets/markers/marker_festival.png'
import markerCourse from '@/assets/markers/marker_course.png'
import markerCurrent from '@/assets/markers/marker_current.png'

const props = defineProps({
    existingItems: {
    type: Array,
    default: () => []
  }
});

const getCategoryMarker = (typeId) => {
  const id = Number(typeId);
  switch (id) {
    case 12: return markerAttraction; // Attraction
    case 14: return markerCulture; // Culture
    case 15: return markerFestival; // Festival
    case 25: return markerCourse; // Course
    case 28: return markerLeports; // Leports
    case 32: return markerAccommodation; // Accommodation
    case 38: return markerShopping; // Shopping
    case 39: return markerFood; // Food
    default: return markerAttraction; // Default
  }
};


const emit = defineEmits(['close', 'add-item']);

const route = useRoute();
const router = useRouter(); 
const planStore = usePlanStore();
const locationStore = useLocationStore();
const { location: userLocation } = storeToRefs(locationStore);

const searchRadius = ref(1000); // Default 1km
const selectedCategories = ref([]);
const results = ref([]);
const isLoading = ref(false);
const hasSearched = ref(false);
const selectedPlace = ref(null);
const mapInstance = ref(null);

const center = ref({ lat: 37.566826, lng: 126.9786567 }); 

// Compute existing items from props to auto-update when parent adds item
const existingPlanItems = computed(() => props.existingItems);

const formatDistance = (meters) => {
    if (meters >= 1000) {
        return (meters / 1000).toFixed(1) + 'km';
    }
    return meters + 'm';
};

// No internal fetch needed, relying on props
// onMounted just ensures bounds logic works
onMounted(() => {
    // If we have items initially, bounds will be fit by onLoadKakaoMap or watchers
});

const fitBoundsToExisting = () => {
  if (mapInstance.value && existingPlanItems.value.length > 0) {
    const bounds = new window.kakao.maps.LatLngBounds();
    existingPlanItems.value.forEach(item => {
        if (item.latitude && item.longitude) {
            bounds.extend(new window.kakao.maps.LatLng(Number(item.latitude), Number(item.longitude)));
        }
    });
    mapInstance.value.setBounds(bounds);
    
    // Auto search is now handled by map event listeners
  }
};

const fitBoundsToResults = () => {
  if (mapInstance.value && results.value.length > 0) {
    const bounds = new window.kakao.maps.LatLngBounds();
    results.value.forEach(place => {
        if (place.latitude && place.longitude) {
            bounds.extend(new window.kakao.maps.LatLng(Number(place.latitude), Number(place.longitude)));
        }
    });
    // Optional: Include current location in bounds so user sees where they are relative to results
    if (userLocation.value) {
        bounds.extend(new window.kakao.maps.LatLng(userLocation.value.lat, userLocation.value.lng));
    }
    mapInstance.value.setBounds(bounds);
  }
};

const onLoadKakaoMap = (map) => {
  mapInstance.value = map;
  
  // Register events for auto-search on move
  if (window.kakao && window.kakao.maps) {
      window.kakao.maps.event.addListener(map, 'dragend', () => {
          handleSearch();
      });
      window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
          handleSearch();
      });
  }

  if (existingPlanItems.value.length > 0) {
      fitBoundsToExisting();
  } else {
      // If no items, try to fetch current location and move there
      locationStore.fetchCurrentLocation().then(async (loc) => {
          if (map) {
              const moveLatLon = new window.kakao.maps.LatLng(loc.lat, loc.lng);
              map.setCenter(moveLatLon);
              // Also update center ref so search uses it
              center.value = { lat: loc.lat, lng: loc.lng };
              
              await handleSearch(); // Search around new location
              
              // Use nextTick to ensure DOM is ready, then fit bounds
              nextTick(() => {
                  setTimeout(() => {
                    console.log("Calling fitBoundsToResults with", results.value.length, "items");
                    fitBoundsToResults(); 
                  }, 200); // Slightly longer delay to be safe
              });
          }
      }).catch((err) => {
          console.error("Location fetch failed:", err);
          // Fallback if location fails
          handleSearch();
      });
  }
};

const updateSearchRadiusFromBounds = () => {
    if (!mapInstance.value) return;
    const bounds = mapInstance.value.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    
    // Simple approximation in meters
    const latDiff = ne.getLat() - sw.getLat();
    const lngDiff = ne.getLng() - sw.getLng();
    const latDist = latDiff * 111000;
    const lngDist = lngDiff * 111000 * Math.cos(sw.getLat() * Math.PI / 180);
    const diag = Math.sqrt(latDist*latDist + lngDist*lngDist);
    
    // Search radius = half of diagonal (approx visible radius)
    searchRadius.value = Math.floor(diag / 2);
    // console.log("Updated Radius:", searchRadius.value, "m");
};

watch(existingPlanItems, () => {
    fitBoundsToExisting();
}, { deep: true });

watch(searchRadius, () => {
    // Removed implementation
});

const goBack = () => {
  emit('close');
};

const clearMap = () => {
    results.value = [];
    selectedPlace.value = null;
    hasSearched.value = false; // Reset search state
};

const onSelectCategory = (categories) => {
    selectedCategories.value = categories;
    handleSearch();
};

const pageNum = ref(1);
const hasMore = ref(true);
const pageSize = 20;

// ... existing refs ...

const handleSearch = async () => {
  let currentLat = center.value.lat;
  let currentLng = center.value.lng;
  
  if (mapInstance.value) {
      updateSearchRadiusFromBounds();
      const mapCenter = mapInstance.value.getCenter();
      currentLat = mapCenter.getLat();
      currentLng = mapCenter.getLng();
  }

  isLoading.value = true;
  hasSearched.value = true;
  pageNum.value = 1; // Reset page
  hasMore.value = true;
  results.value = [];
  selectedPlace.value = null;

  try {
    const response = await attractionApi.getAttractionsBySearch(
      "", 
      currentLat, 
      currentLng, 
      pageNum.value, 
      pageSize, 
      searchRadius.value, 
      selectedCategories.value 
    );

    if (response) {
      const list = response.list || response || [];
      if (list.length < pageSize) hasMore.value = false;
      
      const existingIds = new Set(existingPlanItems.value.map(i => Number(i.attractionId)));
      const getId = (p) => Number(p.contentId || p.no || p.id);

      const filteredList = list.filter(p => !existingIds.has(getId(p)));
      results.value = filteredList;
      console.log("Search results:", filteredList.length);
    }
  } catch (error) {
    console.error('Search error:', error);
    alert('검색 중 오류가 발생했습니다.');
  } finally {
    isLoading.value = false;
  }
};

const loadMore = async () => {
    if (!hasMore.value || isLoading.value) return;
    
    isLoading.value = true;
    pageNum.value++;
    
    try {
        // Use current center/radius (assuming map hasn't moved significantly since last search, 
        // or if it did, handleSearch would have triggered)
        let currentLat = center.value.lat;
        let currentLng = center.value.lng;
        if (mapInstance.value) {
            const mapCenter = mapInstance.value.getCenter();
            currentLat = mapCenter.getLat();
            currentLng = mapCenter.getLng();
        }

        const response = await attractionApi.getAttractionsBySearch(
            "", 
            currentLat, 
            currentLng, 
            pageNum.value, 
            pageSize, 
            searchRadius.value, 
            selectedCategories.value 
        );

        if (response) {
            const list = response.list || response || [];
            if (list.length < pageSize) hasMore.value = false;
            
            const existingIds = new Set(existingPlanItems.value.map(i => Number(i.attractionId)));
            // Also exclude currently loaded results to avoid dupes if API overlaps
            const currentResultIds = new Set(results.value.map(i => Number(i.contentId || i.no || i.id)));
            
            const getId = (p) => Number(p.contentId || p.no || p.id);
            
            const filteredList = list.filter(p => !existingIds.has(getId(p)) && !currentResultIds.has(getId(p)));
            
            results.value = [...results.value, ...filteredList];
            console.log("Loaded more:", filteredList.length, "Total:", results.value.length);
        }
    } catch (error) {
        console.error('Load more error:', error);
    } finally {
        isLoading.value = false;
    }
};

const getPlaceId = (place) => {
  return place.contentId || place.id || place.no;
};

const selectPlace = async (place) => {
  // 1. Initial set with basic info (fallback)
  // We map basic info first so popup opens immediately
  selectedPlace.value = {
    ...place,
    no: getPlaceId(place),
    name: place.title,
    description: '상세 정보를 불러오는 중입니다...',
    tags: [],
    reviewCnt: 0
  };
  
  center.value = { 
    lat: Number(place.latitude), 
    lng: Number(place.longitude) 
  };

  try {
    const id = getPlaceId(place);
    if (!id) return;

    // 2. Fetch detailed info
    const response = await attractionApi.getAttractionById(id);
    console.log("Detailed info fetched:", response);
    
    if (response) {
        // 3. Map to Component Props (Replicating MapComponent logic)
        selectedPlace.value = {
            ...place, // Original list item data
            ...response, // Detailed API response
            // Mapped props for PlaceInfoCard
            no: response.no || response.contentId,
            name: response.title,
            description: response.overview || place.addr1,
            images: [response.firstImage1, response.firstImage2].filter(img => img),
            tags: response.tagNames || [],
            reviewCnt: response.reviewCnt || 0
        };
    }
  } catch (error) {
    console.error("Failed to fetch place details:", error);
    // On error, just ensure description is not loading state
    selectedPlace.value = {
        ...selectedPlace.value,
        description: place.addr1 || '상세 정보 없음'
    };
  }
};

const addToPlan = async (place) => {
  // place is selectedPlace which now has rich info
  if (!confirm(`'${place.name}'을(를) 여행 계획에 추가하시겠습니까?`)) return;

  try {
    // Calculate new ID based on existing items (local max + 1)
    const maxId = existingPlanItems.value.length > 0 
        ? Math.max(...existingPlanItems.value.map(i => i.id || 0)) 
        : 0;
        
    const newItem = {
      id: maxId + 1,
      // planId: provided by parent or not needed for adding
      attractionId: getPlaceId(place), 
      title: place.name,
      description: place.addr1 || place.description, 
      // Use local ISO string for consistency with ToDoListView local state
      startAt: getDefaultStartTime(existingPlanItems.value),
      endAt: getDefaultEndTime(existingPlanItems.value),
      image: place.firstImage1 || (place.images && place.images[0]),
      latitude: Number(place.latitude),
      longitude: Number(place.longitude)
    };
    
    // Emit to parent
    emit('add-item', newItem);
    
    emit('close');
    
  } catch (error) {
    console.error('Add to plan error:', error);
    alert('추가에 실패했습니다.');
  }
};

const getEndTime = (item) => {
    return item.endAt || item.willEndAt || new Date(); 
};

const getDefaultStartTime = (list) => {
  if (list && list.length > 0) {
    const sorted = [...list].sort((a, b) => new Date(getEndTime(b)) - new Date(getEndTime(a)));
    const last = sorted[0];
    const lastEnd = new Date(getEndTime(last));
    return toLocalISOString(new Date(lastEnd.getTime() + 60 * 60 * 1000)); 
  }
  return toLocalISOString(new Date());
};

const getDefaultEndTime = (list) => {
    const startStr = getDefaultStartTime(list);
    const start = new Date(startStr);
    return toLocalISOString(new Date(start.getTime() + 60 * 60 * 1000));
};

const toLocalISOString = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 19); 
};
</script>

<style scoped>
.map-search-view {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.map-area {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.floating-search-container {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 380px; /* Widened slightly */
  max-width: calc(100% - 40px);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 40px); /* Constrain height */
}

.search-header-card {
  background: transparent; /* Transparent as requested */
  /* Remove border/shadow for transparency */
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: transparent;
    padding: 0;
    box-shadow: none;
}



.back-btn {
  background: white;
  border: 1px solid #eee;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.back-btn:hover {
  background: #f5f5f5;
  transform: scale(1.05);
}

.search-btn-primary {
    background: #0095f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background 0.2s;
}

.search-btn-primary:hover {
    background: #0081d6;
}

.search-btn-primary:disabled {
    background: #b2dffc;
    cursor: not-allowed;
}

.search-results-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  overflow: hidden;
  max-height: 400px; /* Limiting height of results list */
  display: flex;
  flex-direction: column;
}

.results-list {
  overflow-y: auto;
  flex: 1;
}

/* Scrollbar styling for results */
.results-list::-webkit-scrollbar {
  width: 6px;
}
.results-list::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 3px;
}

.loading-state, .empty-state {
  padding: 30px;
  text-align: center;
  color: #888;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #eee;
  border-top-color: #0095f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.place-item {
  display: flex;
  padding: 12px;
  gap: 12px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
}

.place-item:last-child {
  border-bottom: none;
}

.place-item:hover {
  background: #f9f9f9;
}

.place-item.active {
  background: #eef7ff;
}

.place-img {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #eee;
}

.place-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.place-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0; /* Text truncation fix */
}

.place-name {
  margin: 0 0 2px 0;
  font-size: 14px;
  font-weight: 700;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.place-addr {
  margin: 0 0 6px 0;
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-btn {
  align-self: flex-start;
  background: white;
  border: 1px solid #0095f6;
  color: #0095f6;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.add-btn:hover {
  background: #0095f6;
  color: white;
}

/* Map Markers */
.map-marker {
  position: relative;
  cursor: pointer;
}

.marker-pin {
  width: 28px;
  height: 28px;
  background: #0095f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}

.map-marker.existing .marker-pin {
  background: #FF6B6B; /* Light Red */
  z-index: 5;
}

.map-marker.existing .marker-label {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #FF6B6B;
    color: #FF6B6B;
}

.map-marker.search-result .marker-dot {
    width: 14px;
    height: 14px;
    background: #0095f6;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}

.map-marker.search-result .marker-label {
    /* Always show label for search results */
    display: block !important;
    top: -24px;
    font-size: 11px;
    padding: 2px 6px;
}

.map-marker.active .marker-dot {
  background: #ff3b30;
  transform: scale(1.2);
}

.marker-label {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  pointer-events: none;
  z-index: 20;
}

/* Place Info Overlay Wrapper to position close button relative to card */
.place-info-overlay {
    position: relative;
    /* PlaceInfoCard has its own styles (margin, shadow, etc), we might need to reset margins if reused */
    /* PlaceInfoCard has margin: 0 20px 20px. We might want to override this via deep selector or wrapper */
    min-width: 320px;
    margin-bottom: 10px;
}

/* Override PlaceInfoCard styles for map context if needed */
.place-info-overlay :deep(.content-card) {
    margin: 0; /* Remove default margins */
    max-width: 340px;
    max-height: 400px;
    overflow-y: auto;
}

.close-overlay-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    background: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.custom-add-btn {
    background: #0095f6;
    color: white;
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    margin-top: 10px;
    transition: background 0.2s;
}

.custom-add-btn:hover {
    background: #0081d6;
}

.clear-map-btn {
    position: absolute;
    bottom: 30px;
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
    z-index: 100;
    cursor: pointer;
    transition: transform 0.2s, background-color 0.2s;
}

.clear-map-btn:hover {
    transform: translateY(-2px);
    background-color: #f9f9f9;
}

.clear-map-btn:active {
    transform: scale(0.95);
    background-color: #f5f5f5;
}




.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
  padding: 20px;
}

.place-card-wrapper {
    background: transparent;
    width: 100%;
    /* Remove max-width constraint on wrapper to allow child to center freely within overlay */
    /* max-width: 400px; */ 
    max-height: 80vh;
    animation: slideUp 0.3s ease-out;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Ensure PlaceInfoCard looks good in modal */
.place-card-wrapper :deep(.content-card) {
    margin: 0;
    /* max-height: 70vh; REMOVED to allow unified scrolling */
    /* overflow-y: auto; REMOVED */
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Hide default actions in PlaceInfoCard when inside modal */
.place-card-wrapper :deep(.card-footer) {
    display: none;
}

.load-more-container {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 90;
}

.load-more-btn {
    background: white;
    border: 1px solid #ddd;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.load-more-btn:hover:not(:disabled) {
    background: #f8f9fa;
    transform: translateY(-2px);
}

.load-more-btn:disabled {
    opacity: 0.7;
    cursor: wait;
}

.spinner-small {
    width: 14px;
    height: 14px;
    border: 2px solid #ccc;
    border-top-color: #0095f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    display: inline-block;
}
</style>

<style>
/* Global styles for Map Custom Overlay Markers */
.custom-marker-wrapper {
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
  pointer-events: auto;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}
.custom-marker-wrapper:hover {
  transform: scale(1.1) translateY(-4px);
  z-index: 100;
}
.custom-marker-image {
  width: 34px;
  height: auto;
  max-height: 34px;
  object-fit: contain;
  display: block;
  background-color: transparent;
  border: none !important;
  box-shadow: none !important;
}

.custom-marker-image.shopping-marker,
.custom-marker-image.festival-marker {
  width: 50px;
  max-height: 50px;
  z-index: 101;
}

.custom-marker-image.food-marker {
  width: 42px;
  max-height: 42px;
  z-index: 101;
}
</style>
