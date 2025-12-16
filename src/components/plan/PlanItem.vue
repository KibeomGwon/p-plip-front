<template>
  <div class="plan-item">
    <div class="status-badge" :class="plan.status">
      {{ plan.status === 'completed' ? '완료' : '예정' }}
    </div>
    <div class="plan-image-wrapper">
      <img :src="plan.image || 'https://via.placeholder.com/100'" alt="Plan Thumbnail" class="plan-image" />
    </div>
    <div class="plan-info">
      <h3 class="plan-title">{{ plan.title }}</h3>
      <p class="plan-date">{{ plan.startDate }} - {{ plan.endDate }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  plan: {
    type: Object,
    required: true,
    default: () => ({
      title: '',
      startDate: '',
      endDate: '',
      image: '',
      status: 'upcoming'
    })
  }
});
</script>

<style scoped>
.plan-item {
  position: relative; /* For absolute positioning of badge */
  display: flex;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #f0f0f0;
  height: 100px;
}

.status-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  border-bottom-left-radius: 12px;
  z-index: 10;
}

.status-badge.completed {
  background-color: #ff5252; /* Red */
}

.status-badge.upcoming {
  background-color: #2196F3; /* Blue */
}

.plan-image-wrapper {
  width: 100px;
  height: 100%;
  background-color: #eee;
}

.plan-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.plan-info {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.plan-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.plan-date {
  font-size: 14px;
  color: #888;
  margin: 0;
}
</style>
