<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <!-- Close Button -->
        <button class="close-btn" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="map-wrapper">
          <KakaoMap ref="mapRef" :lat="origin.lat" :lng="origin.lng" width="100%" height="100%" @onLoadKakaoMap="onLoadKakaoMap">
            <!-- Origin Marker (Blue) -->
            <KakaoMapMarker :lat="origin.lat" :lng="origin.lng" :image="{
                imageSrc: markerCurrent,
                imageWidth: 40,
                imageHeight: 40
              }" />
            
            <!-- Destination Marker (Red) -->
            <KakaoMapMarker :lat="destination.lat" :lng="destination.lng" />

            <!-- Route Polyline -->
             <KakaoMapPolyline 
                v-if="routePath.length > 0"
                :latLngList="routePath" 
                :strokeWeight="5" 
                strokeColor="#FF3B30" 
                :strokeOpacity="0.8" 
             />
          </KakaoMap>
        </div>

        <div class="info-panel">
            <div class="route-summary" v-if="summary">
                <div class="summary-item">
                    <span class="label">거리</span>
                    <span class="value">{{ formatDistance(summary.distance) }}</span>
                </div>
                <div class="summary-item">
                    <span class="label">예상 시간</span>
                    <span class="value">{{ formatDuration(summary.duration) }}</span>
                </div>
                <div class="summary-item">
                    <span class="label">도보 예상</span>
                    <span class="value">{{ formatWalkingTime(summary.distance) }}</span>
                </div>
                <div class="summary-item taxi" v-if="summary.taxiFare">
                    <span class="label">택시비</span>
                    <span class="value">{{ summary.taxiFare.toLocaleString() }}원</span>
                </div>
            </div>
            <div v-else-if="isLoading" class="loading-text">
                경로를 탐색하고 있습니다...
            </div>
            <div v-else class="error-text">
                경로를 찾을 수 없습니다.
            </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { KakaoMap, KakaoMapMarker, KakaoMapPolyline } from 'vue3-kakao-maps';
import routeApi from '@/axios/route';
import markerCurrent from '@/assets/markers/marker_current.png';

const props = defineProps({
  origin: {
    type: Object, // { lat: number, lng: number }
    required: true
  },
  destination: {
    type: Object, // { lat: number, lng: number, name: string }
    required: true
  }
});

const emit = defineEmits(['close']);

const mapRef = ref(null);
const routePath = ref([]);
const summary = ref(null);
const isLoading = ref(false);

const formatWalkingTime = (distanceMeters) => {
    // 5km/h = 5000m/60min = 83.33m/min
    const minutes = Math.ceil(distanceMeters / 83.33);
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    
    if (hours > 0) return `${hours}시간 ${remainingMins}분`;
    return `${minutes}분`;
};

const formatDistance = (meters) => {
    if (meters >= 1000) return (meters / 1000).toFixed(1) + 'km';
    return meters + 'm';
};

const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    
    if (hours > 0) return `${hours}시간 ${remainingMins}분`;
    return `${mins}분`;
};

const fetchRoute = async () => {
    isLoading.value = true;
    routePath.value = [];
    summary.value = null;

    try {
        const originStr = `${props.origin.lng},${props.origin.lat}`;
        const destStr = `${props.destination.lng},${props.destination.lat}`;
        
        const response = await routeApi.get('/v1/directions', {
            params: {
                origin: originStr,
                destination: destStr,
                priority: 'RECOMMEND'
            }
        });

        const routes = response.data.routes[0];
        if (routes) {
            summary.value = routes.summary;
            
            // Extract coordinates from sections -> roads -> vertexes
            const path = [];
            routes.sections.forEach(section => {
                section.roads.forEach(road => {
                    for (let i = 0; i < road.vertexes.length; i += 2) {
                        path.push({
                            lng: road.vertexes[i],
                            lat: road.vertexes[i+1]
                        });
                    }
                });
            });
            routePath.value = path;
            
            fitBounds();
        }
    } catch (error) {
        console.error("Failed to fetch route:", error);
    } finally {
        isLoading.value = false;
    }
};

const fitBounds = () => {
    if (mapRef.value && window.kakao && window.kakao.maps) {
        const bounds = new window.kakao.maps.LatLngBounds();
        bounds.extend(new window.kakao.maps.LatLng(props.origin.lat, props.origin.lng));
        bounds.extend(new window.kakao.maps.LatLng(props.destination.lat, props.destination.lng));
        mapRef.value.setBounds(bounds);
    }
};

const onLoadKakaoMap = (map) => {
    mapRef.value = map;
    fetchRoute();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-container {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  height: 70vh; /* Fixed height for consistency */
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.map-wrapper {
  flex: 1;
  position: relative;
}

.info-panel {
    background: white;
    padding: 16px;
    border-top: 1px solid #eee;
}

.route-summary {
    display: flex;
    justify-content: space-around;
    align-items: center;
}

.summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.summary-item.taxi {
    color: #666;
}

.label {
    font-size: 12px;
    color: #888;
}

.value {
    font-size: 18px;
    font-weight: 700;
    color: #333;
}

.loading-text, .error-text {
    text-align: center;
    padding: 10px;
    color: #666;
    font-size: 14px;
}
</style>
