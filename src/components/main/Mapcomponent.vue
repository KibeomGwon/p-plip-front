<template>
  <div class="map-container">
    <KakaoMap :lat="coordinate.lat" :lng="coordinate.lng" :draggable="true" width="100%" height="100%"
      @onLoadKakaoMap="onLoadKakaoMap">
      <!-- User Location Marker (Red) -->
      <KakaoMapMarker :lat="userLocation.lat" :lng="userLocation.lng" :draggable="true" :clickable="false" :image="{
        imageSrc: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
        imageWidth: 64,
        imageHeight: 69
      }" @onLoadKakaoMapMarker="onLoadUserMarker" />

      <KakaoMapCustomOverlay v-for="marker in markerList" :key="marker.no" :lat="marker.latitude" :lng="marker.longitude"
        :yAnchor="1" :zIndex="10">
        <div class="custom-marker-wrapper" @click.stop="onClickMarker(marker)">
          <img class="custom-marker-image" :class="{ 
            'shopping-marker': Number(marker.contentType) === 38,
            'festival-marker': Number(marker.contentType) === 15,
            'food-marker': Number(marker.contentType) === 39
          }" :src="getCategoryMarker(marker.contentType)" alt="marker" />
        </div>
      </KakaoMapCustomOverlay>
    </KakaoMap>

    <!-- Place Detail Modal (Bottom Sheet) -->
    <Teleport to="body">
      <div v-if="selectedPlace" class="modal-overlay" @click="closeModal">
        <PlaceDetailSheet :place="selectedPlace" @close="closeModal" />
      </div>
    </Teleport>


  </div>
</template>

<script setup>
import { ref, computed, onDeactivated, watch, onMounted } from 'vue';
import { KakaoMap, KakaoMapMarker, KakaoMapCustomOverlay } from 'vue3-kakao-maps';
import PlaceDetailSheet from '@/components/attraction/PlaceDetailSheet.vue';
import { attractionApi } from '@/axios/attraction';
import { useLocationStore } from '@/stores/location';
import { storeToRefs } from 'pinia';

const props = defineProps({
  contentType: {
    type: Array,
    default: () => []
  },
  searchQuery: {
    type: String,
    default: ''
  },
  searchRadius: {
    type: Number,
    default: 0 // 0 means use dynamic zoom-based radius, or handle logic
  }
});

const emit = defineEmits(['update-places', 'update-loading', 'reset-list', 'update-center']);

const coordinate = {
  lat: 33.450701,
  lng: 126.570667
};

const selectedPlace = ref(null);
const mapRef = ref(null);
const markerList = ref([]);
const pageNum = ref(0);
const isLoading = ref(false);
const isLocating = ref(false); // For My Location button spinner
const isLastPage = ref(false);

import markerAttraction from '@/assets/markers/marker_attraction.png'
import markerCulture from '@/assets/markers/marker_culture.png'
import markerFood from '@/assets/markers/marker_food.png'
import markerAccommodation from '@/assets/markers/marker_accommodation.png'
import markerShopping from '@/assets/markers/marker_shopping.png'
import markerLeports from '@/assets/markers/marker_leports.png'
import markerFestival from '@/assets/markers/marker_festival.png'
import markerCourse from '@/assets/markers/marker_course.png'

const locationStore = useLocationStore();
const { location: userLocation, isInitialized } = storeToRefs(locationStore);

// Watchers for filters
watch(() => [props.contentType, props.searchQuery, props.searchRadius], () => {
  console.log("MapComponent: Filters changed");
  fetchAttractions(true, true); // Reset and Center
}, { deep: true });

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

const onLoadKakaoMap = (map) => {
  console.log("on load and call api");
  mapRef.value = map;
  initialLevel.value = map.getLevel();

  // Try to get user's current location via Store
  locationStore.fetchCurrentLocation()
    .then((loc) => {
      console.log(`User stored location: ${loc.lat}, ${loc.lng}`);

      // Move map to user location initially
      if (window.kakao && window.kakao.maps) {
        const moveLatLon = new window.kakao.maps.LatLng(loc.lat, loc.lng);
        map.setCenter(moveLatLon);
      }

      // Explicitly update parent immediately
      emit('update-center', { lat: loc.lat, lng: loc.lng });

      // Fetch data based on this fixed location
      fetchAttractions(true, false);
    })
    .catch((err) => {
      console.error("Geolocation failed:", err);
      // Fallback to default location fetch (Jeju or previous)
      fetchAttractions(true, false);
    });

  if (window.kakao && window.kakao.maps) {
    // Re-sort list when map is dragged (List always reflects distance from CURRENT VIEW)
    window.kakao.maps.event.addListener(map, 'dragend', () => {
      const center = map.getCenter();
      sortMarkers(center.getLat(), center.getLng());
    });

    // Add click listener to map to update user location
    window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
      const latlng = mouseEvent.latLng;
      const lat = latlng.getLat();
      const lng = latlng.getLng();

      console.log(`Map clicked at: ${lat}, ${lng}`);
      locationStore.updateLocation(lat, lng);
    });
  }
}

const fetchAttractions = (isReset = true, shouldCenter = false) => {
  if (!mapRef.value || isLoading.value) return;
  if (!isReset && isLastPage.value) return;

  isLoading.value = true;
  emit('update-loading', true);

  // Use FIXED User Location for search origin from Store
  const centerLat = userLocation.value.lat;
  const centerLng = userLocation.value.lng;
  const level = mapRef.value.getLevel();

  // Use explicit search radius if provided (> 0), otherwise calculate from zoom level
  const radius = props.searchRadius > 0
    ? props.searchRadius
    : Math.floor(100 * Math.pow(2, level - 1));

  if (isReset) {
    pageNum.value = 1;
    isLastPage.value = false;
    markerList.value = []; // Clear data immediately
    emit('reset-list');
  } else {
    pageNum.value++;
  }

  console.log(`Fetching attractions (Page ${pageNum.value}) for Fixed Loc: ${centerLat}, ${centerLng}, Radius: ${radius}m`);

  attractionApi.getAttractionsBySearch(
    props.searchQuery,
    centerLat,
    centerLng,
    pageNum.value,
    10000,
    radius,
    props.contentType.length > 0 ? props.contentType.join(',') : null
  ).then(response => {
    const list = response.list || [];
    isLastPage.value = !response.next;

    if (isReset) {
      markerList.value = list;
      if (shouldCenter && list.length > 0) {
        fitBoundsToMarkers(markerList.value);
      }
    } else {
      markerList.value = [...markerList.value, ...list];
      // Only fit bounds when loading more (User Request)
      // This allows seeing all markers including new ones
      fitBoundsToMarkers(markerList.value);
    }

    // Sort by distance from Current Map Center (Visual center)
    const currentCenter = mapRef.value.getCenter();
    sortMarkers(currentCenter.getLat(), currentCenter.getLng());
  }).catch(error => {
    console.error('api error', error);
  }).finally(() => {
    isLoading.value = false;
    emit('update-loading', false);
  });
};

const sortMarkers = (lat, lng) => {
  emit('update-center', { lat, lng });

  if (!markerList.value || markerList.value.length === 0) return;

  markerList.value.sort((a, b) => {
    const distA = getDistance(lat, lng, a.latitude, a.longitude);
    const distB = getDistance(lat, lng, b.latitude, b.longitude);
    return distA - distB;
  });

  emit('update-places', [...markerList.value]);
};

const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

const deg2rad = (deg) => {
  return deg * (Math.PI / 180)
}

const loadMore = () => {
  console.log("MapComponent: loadMore called");
  fetchAttractions(false);
};

const initialLevel = ref(3);

const fitBoundsToMarkers = (markers) => {
  if (!mapRef.value || !window.kakao || !window.kakao.maps || markers.length === 0) return;

  const bounds = new window.kakao.maps.LatLngBounds();
  markers.forEach(marker => {
    bounds.extend(new window.kakao.maps.LatLng(marker.latitude, marker.longitude));
  });

  mapRef.value.setBounds(bounds);
};

const moveToLocation = (lat, lng, zoomLevel = null) => {
  if (mapRef.value && window.kakao && window.kakao.maps) {
    const moveLatLon = new window.kakao.maps.LatLng(lat, lng);

    // Pan first
    mapRef.value.panTo(moveLatLon);

    // Zoom after a delay to allow pan to start/smoothly blend
    if (zoomLevel !== null) {
      setTimeout(() => {
        mapRef.value.setLevel(zoomLevel, { animate: true });
      }, 300);
    }
  }
};



const onClickMarker = async (marker) => {
  console.log('Marker clicked:', marker);

  // Center map on marker and reset zoom
  moveToLocation(marker.latitude, marker.longitude, initialLevel.value);

  try {
    const response = await attractionApi.getAttractionById(marker.no);
    console.log('Detail response:', response);

    // Map API response to component props
    // API: title, overview, firstImage1, firstImage2, tagNames
    // Component: name, description, images, tags
    const placeData = {
      ...response, // Keep original data too just in case
      no: response.no,
      name: response.title,
      description: response.overview,
      images: [response.firstImage1, response.firstImage2].filter(img => img), // Filter out empty/null images
      tags: response.tagNames || [],
      reviewCnt: response.reviewCnt
    };

    selectedPlace.value = placeData;
  } catch (error) {
    console.error('Failed to fetch place details:', error);
    // Fallback? or just alert
  }
};

const onLoadMarker = (markerRef, markerItem) => {
  if (markerRef && window.kakao && window.kakao.maps) {
    window.kakao.maps.event.addListener(markerRef, 'click', () => {
      onClickMarker(markerItem);
    });
  }
};

const onLoadUserMarker = (markerRef) => {
  if (markerRef && window.kakao && window.kakao.maps) {
    window.kakao.maps.event.addListener(markerRef, 'dragend', () => {
      const pos = markerRef.getPosition();
      const lat = pos.getLat();
      const lng = pos.getLng();

      console.log(`User dragged marker to: ${lat}, ${lng}`);
      locationStore.updateLocation(lat, lng);

      // Refresh attractions around new location
      // fetchAttractions(true, false);
    });
  }
};

const resetToCurrentLocation = async () => {
  if (isLocating.value) return;
  isLocating.value = true;
  try {
    const loc = await locationStore.fetchCurrentLocation();
    moveToLocation(loc.lat, loc.lng, initialLevel.value);
    // fetchAttractions(true, false);
  } catch (e) {
    console.error("Failed to reset location:", e);
  } finally {
    isLocating.value = false;
  }
};

const closeModal = () => {
  selectedPlace.value = null;
};

defineExpose({
  loadMore,
  moveToLocation,
  resetToCurrentLocation,
  getMapCenter: () => {
    if (mapRef.value) {
      const center = mapRef.value.getCenter();
      return { lat: center.getLat(), lng: center.getLng() };
    }
    return userLocation.value;
  },
  setMarkers: (list) => {
    console.log("MapComponent: setMarkers called with", list.length, "items");
    markerList.value = list;
    // Emit update-places is optional if MainView handles it, but good for consistency
    emit('update-places', [...markerList.value]);
  },
  fitBoundsToMarkers // Expose this function
});

onDeactivated(() => {
  closeModal();
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  /* Ensure it's on top of everything */
  display: flex;
  touch-action: none;
  /* Prevent map interaction through overlay */
  align-items: center;
  /* Center vertically */
  justify-content: center;
  /* Center horizontally */
  animation: fadeIn 0.3s ease-out;
  padding: 20px;
  /* Add padding to prevent touching edges */
  box-sizing: border-box;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.my-location-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #0095f6;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 200;
  /* Above bottom sheet if possible, but map is z=0 */
  transition: transform 0.2s, background 0.2s;
}

.my-location-btn:active {
  transform: scale(0.95);
}

.my-location-btn:disabled {
  background: #999;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
```
