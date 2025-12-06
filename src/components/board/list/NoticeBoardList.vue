<template>
  <div class="notice-board-container">
    <div class="notice-list">
      <div v-for="notice in notices" :key="notice.id" class="notice-item" @click="goToDetail(notice.id)">
        <div class="notice-tag">공지</div>
        <h3 class="notice-title">{{ notice.title }}</h3>
        <span class="notice-date">{{ notice.date }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const notices = ref([
  { id: 1, title: 'P-PliP 서비스 점검 안내', date: '2025.12.01' },
  { id: 2, title: '개인정보 처리방침 변경 안내', date: '2025.11.20' },
  { id: 3, title: '새로운 기능 업데이트: AI 여행 비서', date: '2025.11.15' },
  { id: 4, title: '커뮤니티 이용 수칙 안내', date: '2025.11.01' },
  { id: 5, title: '11월 베스트 여행기 선정 결과', date: '2025.11.30' }
]);

const goToDetail = (id) => {
  router.push({ name: 'noticeboard-detail', params: { id } });
};
</script>

<style scoped>
.notice-board-container {
  padding: 20px;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.notice-item:active {
  background: #f9f9f9;
}

.notice-tag {
  align-self: flex-start;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 11px;
  color: #666;
  font-weight: 600;
}

.notice-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.4;
}

.notice-date {
  font-size: 12px;
  color: #999;
  align-self: flex-end;
}
</style>