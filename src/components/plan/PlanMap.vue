<template>
  <div class="map-container">
    <KakaoMap :lat="center.lat" :lng="center.lng" :draggable="true" width="100%" height="100%"
      @onLoadKakaoMap="onLoadKakaoMap">

      <!-- Custom Overlays for Markers -->
      <KakaoMapCustomOverlay v-for="(marker, index) in markers" :key="index"
        :lat="marker.latitude"
        :lng="marker.longitude"
        :yAnchor="1"
      >
        <div class="custom-marker-container">
          
          <!-- Info Card (Title + Image) - Displayed ABOVE Pin -->
          <div class="marker-card">
            <div class="marker-img" v-if="marker.image">
              <img :src="marker.image" alt="img" />
            </div>
            <div class="marker-title">{{ marker.title }}</div>
          </div>

          <!-- Number Badge (Pin) -->
          <div class="marker-pin">
            {{ index + 1 }}
          </div>
          
        </div>
      </KakaoMapCustomOverlay>

    </KakaoMap>
  </div>
</template>

<script setup>
import { ref, watch, toRefs, onUnmounted } from 'vue';
import { KakaoMap, KakaoMapCustomOverlay } from 'vue3-kakao-maps';

const props = defineProps({
  markers: {
    type: Array,
    default: () => []
  }
});

const { markers } = toRefs(props);
const mapRef = ref(null);
const center = ref({ lat: 33.450701, lng: 126.570667 });
let polyline = null;

const onLoadKakaoMap = (map) => {
  mapRef.value = map;
  if (markers.value.length > 0) {
    fitBoundsToMarkers(markers.value);
    drawPolyline(markers.value);
  }
};

const drawPolyline = (list) => {
  if (!mapRef.value || !window.kakao || !window.kakao.maps) return;

  // Remove existing polyline
  if (polyline) {
    polyline.setMap(null);
  }

  const linePath = list.map(m => new window.kakao.maps.LatLng(m.latitude, m.longitude));

  polyline = new window.kakao.maps.Polyline({
    path: linePath, // linePath array
    strokeWeight: 5, // Thicker Line
    strokeColor: '#00BFFF', // Deep Sky Blue
    strokeOpacity: 0.8, 
    strokeStyle: 'shortdash' // Changed to dotted/dashed line as requested
  });

  polyline.setMap(mapRef.value);
};

const fitBoundsToMarkers = (list) => {
  if (!mapRef.value || !window.kakao || !window.kakao.maps || list.length === 0) return;

  const bounds = new window.kakao.maps.LatLngBounds();
  list.forEach(marker => {
    bounds.extend(new window.kakao.maps.LatLng(marker.latitude, marker.longitude));
  });

  mapRef.value.setBounds(bounds);
};

// Watch for marker changes
watch(markers, (newMarkers) => {
  if (mapRef.value) {
    if (newMarkers.length > 0) {
      fitBoundsToMarkers(newMarkers);
      drawPolyline(newMarkers);
    } else {
      if (polyline) polyline.setMap(null);
    }
  }
}, { deep: true });

onUnmounted(() => {
   if (polyline) polyline.setMap(null);
});

defineExpose({
  fitBoundsToMarkers
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}

.custom-marker-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Removed transform to respect yAnchor=1 (bottom aligned to point) */
}

/* Info Card */
.marker-card {
  background: white;
  padding: 8px 10px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column; /* Stack image and title */
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 100px; /* Ensure some width */
  max-width: 140px;
  margin-bottom: 8px;
  pointer-events: none;
  text-align: center;
}

.marker-img {
  width: 80px; /* Much larger image as per layout change implication */
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #eee;
}

.marker-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.marker-title {
  font-size: 13px;
  font-weight: 700;
  color: #333;
  width: 100%;
  /* Removed overflow/ellipsis/nowrap to allow wrapping */
  white-space: normal;
  word-break: keep-all; /* Keep words together for Korean if possible, or use break-word */
  line-height: 1.3; /* Improve readability for multiple lines */
  padding: 0 4px;
  box-sizing: border-box;
}

/* Number Pin */
.marker-pin {
  width: 32px;
  height: 32px;
  background-color: #00BFFF; /* Deep Sky Blue */
  color: white;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
  z-index: 10;
}
</style>
