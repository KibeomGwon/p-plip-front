<template>
  <div class="review-item">
    <div class="review-header">
      <div class="user-profile">
        <div class="avatar" :style="{ backgroundColor: review.avatarColor }">
          <img :src="review.avatarUrl ? getImageUrl(review.avatarUrl) : defaultImage" alt="User Avatar" />
        </div>
        <span class="username">{{ review.author }}</span>
      </div>
      <div class="date-container">
        <span class="date create-label">
          {{ formatTime(review.createdAt) }}
          <span class="tooltip-text">{{ formattedCreateDate }}</span>
        </span>
        <span v-if="review.updatedAt" class="edited-label">
          (수정됨)
          <span class="tooltip-text">{{ formattedUpdateDate }}</span>
        </span>
      </div>
    </div>

    <!-- Edit/Delete Actions -->
    <div v-if="review.isOwner" class="review-actions">
      <button class="action-btn" @click="handleEdit">수정</button>
      <button class="action-btn delete" @click="handleDelete">삭제</button>
    </div>
    
    <div v-if="review.photos && review.photos.length > 0" class="review-photos">
      <ImageCarousel :images="getImagesUrl(review.photos)" />
    </div>

    <p class="review-text">
        {{ displayText }}
        <button v-if="isLongText && !isExpanded" @click="toggleExpand" class="read-more-btn">...더보기</button>
        <button v-if="isLongText && isExpanded" @click="toggleExpand" class="read-more-btn">접기</button>
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'; // Added ref
import ImageCarousel from '@/components/common/ImageCarousel.vue';
import { useImages, useImage } from '@/composables/useImage';
import { useRelativeTime } from '@/composables/useRelativeTime';
import { reviewApi } from '@/axios/review';
import { fileApi } from '@/axios/file';
import { useDefaultImage } from '@/composables/useDefaultImage';

const { getImagesUrl } = useImages();
const { getImageUrl } = useImage();
const { formatTime } = useRelativeTime();
const defaultImage = useDefaultImage();

const emit = defineEmits(['delete', 'edit']);

const props = defineProps({
  review: {
    type: Object,
    required: true
  }
});

const isExpanded = ref(false);
const maxLength = 200;

const isLongText = computed(() => {
    return props.review.text && props.review.text.length > maxLength;
});

const displayText = computed(() => {
    if (!isLongText.value || isExpanded.value) {
        return props.review.text;
    }
    return props.review.text.slice(0, maxLength);
});

const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
};


const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

const formattedUpdateDate = computed(() => {
  return formatDate(props.review.updatedAt);
});

const formattedCreateDate = computed(() => {
  return formatDate(props.review.createdAt);
});

const handleDelete = async () => {
  if (!confirm('정말로 삭제하시겠습니까?')) return;
  
  try {
    if (props.review.photos && props.review.photos.length > 0) {
      await Promise.all(props.review.photos.map(photo => fileApi.deleteFile(photo.id, "REVIEW")));
    }
    await reviewApi.deleteReview(props.review.id);
    emit('delete', props.review.id);
  } catch (err) {
    console.error(err);
    alert('삭제에 실패했습니다.');
  }
};

const handleEdit = () => {
  emit('edit', props.review);
};
</script>

<style scoped>
.review-item {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: #555;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.username {
  font-weight: 700;
  font-size: 15px;
  color: #333;
}

.date {
  font-size: 12px;
  color: #999;
}

.date-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.edited-label, .create-label {
  position: relative;
  cursor: help;
}

.edited-label {
  font-size: 11px;
  color: #bbb;
}

.tooltip-text {
  visibility: hidden;
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  text-align: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

/* Tooltip Arrow */
.tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -4px;
  border-width: 4px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
}

.edited-label:hover .tooltip-text,
.edited-label:active .tooltip-text,
.create-label:hover .tooltip-text,
.create-label:active .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.review-photos {
  margin-bottom: 12px;
  border-radius: 16px;
  overflow: hidden;
}

/* Old carousel styles removed */

.review-text {
  font-size: 15px;
  line-height: 1.5;
  color: #444;
  margin: 0;
  word-break: break-word;
}

.review-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  justify-content: flex-end;
}

.action-btn {
  background: none;
  border: none;
  font-size: 13px;
  color: #999;
  cursor: pointer;
  padding: 4px 8px;
}

.action-btn:hover {
  color: #333;
  text-decoration: underline;
}


.action-btn.delete {
  color: #ff3b30;
}

.read-more-btn {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
    margin-left: 4px;
    font-weight: 500;
}

.read-more-btn:hover {
    color: #333;
    text-decoration: underline;
}
</style>
