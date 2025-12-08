<template>
  <div class="action-buttons">
    <button class="primary-btn">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      이 장소로 향하기
    </button>
    <button class="secondary-btn">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      AI에게 다음 계획 요청하기
    </button>
  </div>
</template>

<script setup>
defineProps({
  place: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
      description: '',
      images: [],
      tags: []
    })
  }
});

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
  background: #2196F3; /* Blue */
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
</style>
