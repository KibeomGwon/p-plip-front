<template>
  <div class="content-card">
    <div class="title-row">
      <h1 class="place-title">{{ formattedTitle }}</h1>
      <button class="review-link" @click="goToReview">
        리뷰 {{ place.reviewCnt || 0 }}개 <span class="material-icons">></span>
      </button>
    </div>
    <div class="description-wrapper">
      <p class="place-description" :class="{ 'expanded': isExpanded }">
        {{ place.description }}
      </p>
      <button 
        v-if="place.description && place.description.length > 80" 
        class="more-btn" 
        @click="toggleExpand"
      >
        {{ isExpanded ? '닫기' : '더보기' }}
      </button>
    </div>
    
    <div class="tags">
      <span v-for="tag in place.tags" :key="tag" class="tag">#{{ tag }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
  place: {
    type: Object,
    required: true,
    default: () => ({
      no: '',
      name: '',
      description: '',
      tags: [],
      reviewCnt: 0
    })
  }
});

const router = useRouter();
const route = useRoute();
const isExpanded = ref(false);

const formattedTitle = computed(() => {
  const name = props.place.name || '';
  if (name.length > 8) {
    return name.replace(/\s+/g, '\n');
  }
  return name;
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const goToReview = () => {
  // Assuming the place ID is available in the current route params
  // or passed via props. For now, using route params as default
  const placeId = props.place.no; 
  router.push({ 
    name: 'place-reviews', 
    params: { id: placeId },
    query: { name: props.place.name }
  });
};
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
  margin: 0;
  white-space: pre-line;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-link {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #0095f6;
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.review-link .material-icons {
  font-size: 16px;
  margin-left: 2px;
}

.description-wrapper {
  margin-bottom: 20px;
}

.place-description {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin: 0; /* Remove bottom margin here, controlled by wrapper */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
}

.place-description.expanded {
  -webkit-line-clamp: unset;
  line-clamp: unset;
  display: block; /* Fallback */
}

.more-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 13px;
  margin-top: 4px;
  cursor: pointer;
  padding: 0;
  font-weight: 600;
}

.more-btn:hover {
  color: #666;
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
