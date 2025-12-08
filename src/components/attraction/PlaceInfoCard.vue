<template>
  <div class="content-card">
    <h1 class="place-title">{{ place.name }}</h1>
    <p class="place-description">{{ place.description }}</p>
    
    <div class="tags">
      <span v-for="tag in place.tags" :key="tag" class="tag">#{{ tag }}</span>
    </div>
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
      tags: []
    })
  }
});
</script>

<style scoped>
.content-card {
  margin: 0 20px 20px;
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.place-title {
  font-size: 24px;
  font-weight: 800;
  color: #333;
  margin: 0 0 12px;
}

.place-description {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: #f0f7ff;
  color: #0095f6; /* Primary Blue */
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

/* Specific tag colors from image */
.tag:nth-child(1) { background: #e8f5e9; color: #2e7d32; } /* Greenish */
.tag:nth-child(2) { background: #ffebee; color: #c62828; } /* Reddish */
.tag:nth-child(3) { background: #fff8e1; color: #f9a825; } /* Yellowish */
</style>
