<template>
  <div class="map-container">
    <KakaoMap :lat="coordinate.lat" :lng="coordinate.lng" :draggable="true" width="100%" height="100%">
      <KakaoMapMarker 
        v-for="marker in markerList" 
        :key="marker.key"
        :lat="marker.lat" 
        :lng="marker.lng"
        :clickable="true"
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
import { ref } from 'vue';
import { KakaoMap, KakaoMapMarker } from 'vue3-kakao-maps';
import PlaceDetailSheet from '@/components/attraction/PlaceDetailSheet.vue';

const coordinate = {
  lat: 33.450701,
  lng: 126.570667
};

const selectedPlace = ref(null);

const markerList = ref([
  {
    key: 1,
    lat: 33.450701,
    lng: 126.570667,
    name: '카카오 스페이스 닷원',
    description: '제주도에 위치한 카카오 본사입니다. 아름다운 건축물과 자연이 어우러진 공간입니다.',
    images: [
      'https://images.unsplash.com/photo-1519046904884-53103b34b271?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['IT성지', '제주여행', '건축미']
  },
  {
    key: 2,
    lat: 33.450936,
    lng: 126.569477,
    name: '제주 첨단과학기술단지',
    description: '다양한 IT 기업들이 모여있는 제주의 실리콘밸리입니다.',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['비즈니스', '과학기술', '혁신']
  },
  {
    key: 3,
    lat: 33.451393,
    lng: 126.570738,
    name: '즐거운 산책로',
    description: '가볍게 걷기 좋은 산책로입니다. 제주의 맑은 공기를 마시며 힐링하세요.',
    images: [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['산책', '힐링', '자연']
  }
]);

const onClickMarker = (marker) => {
  console.log('Marker clicked:', marker);
  selectedPlace.value = marker;
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