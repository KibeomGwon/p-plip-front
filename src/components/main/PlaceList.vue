<template>
  <div 
    ref="listContainer"
    class="place-list-container" 
  >
    <div class="place-list-header">
      <h2 class="section-title">주변 추천 장소</h2>
    </div>
    
    <div class="place-list" ref="scrollContainer">
      <div v-for="place in places" :key="place.id" class="place-card">
        <div class="place-image" :style="{ backgroundImage: `url(${place.image})` }"></div>
        <div class="place-info">
          <h3 class="place-name">{{ place.name }}</h3>
          <p class="place-desc">{{ place.description }}</p>
          <button class="detail-btn" @click="goToDetail(place.id)">자세히 보기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const emit = defineEmits(['close']);
const listContainer = ref(null);

const goToDetail = (id) => {
  router.push({ name: 'place-detail', params: { id } });
};
const scrollContainer = ref(null);



const places = ref([
  {
    id: 1,
    name: '카페 아늑',
    description: '조용한 분위기에서 즐기는 스페셜티 커피',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 2,
    name: '하늘공원',
    description: '도시 전경을 한눈에 볼 수 있는 휴식처',
    image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 3,
    name: '국립현대미술관',
    description: '다양한 현대 미술 작품을 감상할 수 있는 곳',
    image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 4,
    name: '경복궁',
    description: '조선 시대의 역사를 느낄 수 있는 고궁',
    image: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  }
]);
</script>

<style scoped>
.place-list-container {
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 20px 20px 0 20px; /* Remove bottom padding from container */
  box-shadow: 0 -4px 10px rgba(0,0,0,0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.place-list-header {
  flex-shrink: 0;
}

.place-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px; /* Space for NavBar */
}

.place-list::-webkit-scrollbar {
  width: 4px;
}

.place-list::-webkit-scrollbar-track {
  background: transparent;
}

.place-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.close-btn {
  display: block;
  width: 100%;
  padding: 10px 0;
  background: transparent;
  border: none;
  font-size: 14px;
  color: #999;
  cursor: pointer;
  margin-bottom: 10px;
}

.close-btn:hover {
  color: #666;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #333;
}

.place-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.place-card {
  display: flex;
  gap: 16px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 16px;
  align-items: center;
}

.place-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-color: #ddd;
  flex-shrink: 0;
}

.place-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.place-name {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #333;
}

.place-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 8px;
  line-height: 1.4;
}

.detail-btn {
  align-self: flex-end;
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.detail-btn:hover {
  background: #0056b3;
}
</style>
