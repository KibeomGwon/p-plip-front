<template>
  <div class="map-container">
    <KakaoMap :lat="coordinate.lat" :lng="coordinate.lng" :draggable="true" width="100%" height="100%" @onLoadKakaoMap="onLoadKakaoMap">
      <KakaoMapMarker 
        v-for="marker in markerList" 
        :key="marker.no"
        :lat="marker.latitude" 
        :lng="marker.longitude"
        :clickable="true"
        :title="marker.title"
        @onLoadKakaoMapMarker="onLoadMarker($event, marker)"
        @onClickKakaoMapMarker="onClickMarker(marker)"
      />
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
import { ref, computed, onDeactivated, watch } from 'vue';
import { KakaoMap, KakaoMapMarker } from 'vue3-kakao-maps';
import PlaceDetailSheet from '@/components/attraction/PlaceDetailSheet.vue';
import { attractionApi } from '@/api/attraction';

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

const emit = defineEmits(['update-places', 'update-loading', 'reset-list']);

const coordinate = {
  lat: 33.450701,
  lng: 126.570667
};

const selectedPlace = ref(null);
const mapRef = ref(null);
const markerList = ref([]);
const pageNum = ref(1);
const isLoading = ref(false);
const isLastPage = ref(false);

// Watchers for filters
watch(() => [props.contentType, props.searchQuery, props.searchRadius], () => {
  console.log("MapComponent: Filters changed");
  fetchAttractions(true, true); // Reset and Center
}, { deep: true });

const userLocation = ref({ lat: 33.450701, lng: 126.570667 });

const onLoadKakaoMap = (map) => {
  console.log("on load and call api");
  mapRef.value = map;
  initialLevel.value = map.getLevel();

  // Try to get user's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      console.log(`User stored location: ${lat}, ${lng}`);
      userLocation.value = { lat, lng };
      
      // Move map to user location initially
      const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
      map.setCenter(moveLatLon);
      
      // Fetch data based on this fixed location
      fetchAttractions(true, false);
    }, (err) => {
      console.error("Geolocation failed:", err);
      // Fallback to default location fetch
      fetchAttractions(true, false);
    });
  } else {
    // Fallback if no geolocation support
    fetchAttractions(true, false);
  }

  if (window.kakao && window.kakao.maps) {
    // Re-sort list when map is dragged (List always reflects distance from CURRENT VIEW)
    window.kakao.maps.event.addListener(map, 'dragend', () => {
        const center = map.getCenter();
        sortMarkers(center.getLat(), center.getLng());
    });
  }
}

const fetchAttractions = (isReset = true, shouldCenter = false) => {
  if (!mapRef.value || isLoading.value) return;
  if (!isReset && isLastPage.value) return;
  
  isLoading.value = true;
  emit('update-loading', true);
  
  // Use FIXED User Location for search origin
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
    10, 
    radius, 
    props.contentType.length > 0 ? props.contentType.join(',') : null
  ).then(response => {
    const list = response.list || [];
    isLastPage.value = !response.next;

    if (isReset) {
      markerList.value = list;
    } else {
      markerList.value = [...markerList.value, ...list];
    }
    
    // Sort by distance from Current Map Center (Visual center)
    const currentCenter = mapRef.value.getCenter();
    sortMarkers(currentCenter.getLat(), currentCenter.getLng());

    // Center map on the nearest result if requested
    if (shouldCenter && markerList.value.length > 0) {
      const nearest = markerList.value[0];
      moveToLocation(nearest.latitude, nearest.longitude);
    }

    // sortMarkers already emits update-places, but we might need it before moving?
    // sortMarkers emits. So we don't need explicit emit here, or we can leave it?
    // Let's rely on sortMarkers to emit.
  }).catch(error => {
    console.error(error);
  }).finally(() => {
    isLoading.value = false;
    emit('update-loading', false);
  });
};

const sortMarkers = (lat, lng) => {
  if (!markerList.value || markerList.value.length === 0) return;
  
  markerList.value.sort((a, b) => {
    const distA = getDistance(lat, lng, a.latitude, a.longitude);
    const distB = getDistance(lat, lng, b.latitude, b.longitude);
    return distA - distB;
  });
  
  emit('update-places', [...markerList.value]);
  emit('update-center', { lat, lng });
};

const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); 
  const dLng = deg2rad(lng2 - lng1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

const deg2rad = (deg) => {
  return deg * (Math.PI/180)
}

const loadMore = () => {
  console.log("MapComponent: loadMore called");
  fetchAttractions(false);
};

const initialLevel = ref(3);

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

defineExpose({
  loadMore,
  moveToLocation,
  getMapCenter: () => {
    if (mapRef.value) {
      const center = mapRef.value.getCenter();
      return { lat: center.getLat(), lng: center.getLng() };
    }
    return userLocation.value;
  },
  setMarkers: (list) => {
    markerList.value = list;
    emit('update-places', [...markerList.value]);
    if (list.length > 0) {
        moveToLocation(list[0].latitude, list[0].longitude);
    }
  }
});

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

const closeModal = () => {
  selectedPlace.value = null;
};

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
  z-index: 9999; /* Ensure it's on top of everything */
  display: flex;
  touch-action: none; /* Prevent map interaction through overlay */
  align-items: center; /* Center vertically */
  justify-content: center; /* Center horizontally */
  animation: fadeIn 0.3s ease-out;
  padding: 20px; /* Add padding to prevent touching edges */
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

</style>