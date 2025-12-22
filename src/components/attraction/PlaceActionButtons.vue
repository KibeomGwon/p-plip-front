<template>
  <div class="action-buttons">
    <button class="primary-btn" @click="handleDirections">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="white" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
      이 장소로 향하기
    </button>
    <button class="secondary-btn" @click="handleAiPlanRequest">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      AI에게 다음 계획 요청하기
    </button>

    <PlanThemeInputModal v-model="showThemeModal" @confirm="handleThemeConfirm" />
    
    <RouteModal 
      v-if="showRouteModal"
      :origin="routeOrigin"
      :destination="routeDestination"
      @close="showRouteModal = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePlanStore } from '@/stores/plan';
import PlanThemeInputModal from './PlanThemeInputModal.vue';
import RouteModal from './RouteModal.vue';

const props = defineProps({
  place: {
    type: Object,
    required: true,
    default: () => ({
      no: '', // Assuming 'no' is the ID based on usage in PlaceInfoCard
      name: '',
      description: '',
      images: [],
      tags: []
    })
  }
});

const emit = defineEmits(['close']);
const planStore = usePlanStore();
const showThemeModal = ref(false);

// Route Modal State
const showRouteModal = ref(false);
const routeOrigin = ref({ lat: 0, lng: 0 });
const routeDestination = ref({ lat: 0, lng: 0, name: '' });

const handleAiPlanRequest = () => {
  showThemeModal.value = true;
};

const handleDirections = () => {
  if (!props.place) return;

  const lat = props.place.latitude || props.place.lat || props.place.mapy;
  const lng = props.place.longitude || props.place.lng || props.place.mapx;
  const name = props.place.name || props.place.title || '도착지';

  if (lat && lng) {
    // Try to get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          routeOrigin.value = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          routeDestination.value = {
            lat: Number(lat),
            lng: Number(lng),
            name: name
          };
          showRouteModal.value = true;
        },
        (error) => {
          console.warn("Location access denied or failed:", error);
          alert("현재 위치를 가져올 수 없어 경로를 탐색할 수 없습니다.");
        }
      );
    } else {
      alert("브라우저가 위치 정보를 지원하지 않습니다.");
    }
  } else {
    console.warn("Place coordinates missing:", props.place);
    alert("장소 위치 정보를 찾을 수 없습니다.");
  }
};

const handleThemeConfirm = ({ theme, startDate, endDate }) => {
  if (props.place && props.place.no) {
    // Fire and forget - Store handles loading state and toast
    planStore.suggestPlan(String(props.place.no), theme, startDate, endDate);
    emit('close');
  } else {
    console.warn("Place ID is missing");
    emit('close');
  }
};
</script>

<style scoped>
.action-buttons {
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.primary-btn {
  width: 100%;
  padding: 16px;
  background: #2196F3;
  /* Blue */
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.secondary-btn {
  width: 100%;
  padding: 16px;
  background: white;
  color: #333;
  border: 1px solid #eee;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
