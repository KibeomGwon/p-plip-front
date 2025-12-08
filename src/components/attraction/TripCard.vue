<template>
  <div class="going-card" @click="navigateToTodo">
    <div class="card-image-wrapper" :style="{ backgroundImage: `url(${trip.image})` }">
      <span class="d-day-badge">{{ calculateDDay(trip.startDate) }}</span>
      <div class="card-overlay">
        <h3 class="trip-title">{{ trip.title }}</h3>
        <p class="trip-date">{{ trip.startDate }} - {{ trip.endDate }}</p>
      </div>
    </div>
    <div class="card-footer">
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: trip.progress + '%' }"></div>
      </div>
      <div class="progress-info">
        <span>{{ trip.progress }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  trip: {
    type: Object,
    required: true
  }
});

const router = useRouter();

const navigateToTodo = () => {
  router.push({ name: 'todo-list', params: { id: props.trip.id } });
};

const calculateDDay = (startDate) => {
  const today = new Date();
  // Reset time to midnight for accurate day calculation
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(startDate);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'D-Day';
  if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
  return `D-${diffDays}`;
};
</script>

<style scoped>
.going-card {
  min-width: 240px; /* 300px * 0.8 */
  width: 72%; /* 90% * 0.8 */
  background: white;
  border-radius: 16px; /* Scaled down radius */
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s;
}

.going-card:active {
  transform: scale(0.98);
}

.card-image-wrapper {
  position: relative;
  height: 160px; /* 200px * 0.8 */
  background-size: cover;
  background-position: center;
}

.d-day-badge {
  position: absolute;
  top: 12px; /* Scaled down */
  left: 12px; /* Scaled down */
  background-color: #007bff;
  color: white;
  padding: 3px 10px; /* Scaled down */
  border-radius: 6px; /* Scaled down */
  font-weight: 700;
  font-size: 11px; /* Scaled down */
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px; /* Scaled down */
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
  color: white;
}

.trip-title {
  font-size: 18px; /* ~22px * 0.8 */
  font-weight: 700;
  margin: 0 0 4px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.trip-date {
  font-size: 11px; /* ~14px * 0.8 */
  margin: 0;
  opacity: 0.9;
}

.card-footer {
  padding: 12px; /* Scaled down */
}

.progress-bar-container {
  height: 5px; /* Scaled down */
  background-color: #eee;
  border-radius: 2.5px;
  margin-bottom: 10px; /* Scaled down */
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #007bff;
  border-radius: 2.5px;
}

.progress-info {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 11px; /* Scaled down */
  color: #666;
}
</style>
