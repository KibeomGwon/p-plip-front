<template>
  <div class="comments-container">
    <div class="section-divider"></div>
    <div class="comments-header-bar">
      <span class="comments-label">댓글</span>
      <span class="comments-count">{{ comments ? comments.length : 0 }}</span>
    </div>

    <!-- Comment Input Section -->
    <div class="comment-input-section">
      <div class="current-user-avatar">
        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Me" class="avatar-img">
      </div>
      <div class="input-wrapper">
        <input 
          v-model="newComment" 
          type="text" 
          placeholder="댓글을 입력하세요..." 
          class="comment-input"
          @keyup.enter="submitComment"
        />
        <button 
          class="comment-submit-btn" 
          :disabled="!newComment.trim()"
          @click="submitComment"
        >
          등록
        </button>
      </div>
    </div>
    
    <div class="comments-section">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-avatar">
          {{ comment.author ? comment.author[0] : '?' }}
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">{{ comment.author }}</span>
            <span class="comment-date">2시간 전</span>
          </div>
          <p class="comment-text">{{ comment.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  comments: {
    type: Array,
    required: true,
    default: () => []
  }
});

const emit = defineEmits(['add-comment']);
const newComment = ref('');

const submitComment = () => {
  if (!newComment.value.trim()) return;
  
  emit('add-comment', newComment.value);
  newComment.value = '';
};
</script>

<style scoped>
.comments-container {
  margin-top: 12px;
}

.section-divider {
  height: 1px;
  background-color: #eee;
  margin: 12px 16px 16px;
}

.comments-header-bar {
  padding: 0 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.comment-input-section {
  padding: 0 16px 16px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.current-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 4px 12px;
}

.comment-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 0;
  font-size: 14px;
  outline: none;
  color: #333;
}

.comment-input::placeholder {
  color: #999;
}

.comment-submit-btn {
  border: none;
  background: none;
  color: #0095f6;
  font-weight: 600;
  font-size: 14px;
  padding: 4px 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.comment-submit-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.comments-label {
  font-size: 16px;
  font-weight: 700;
  color: #0f0f0f;
}

.comments-count {
  font-size: 16px;
  color: #606060;
}

.comments-section {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 2px;
}

.comment-author {
  font-size: 13px;
  font-weight: 600;
  color: #0f0f0f;
  margin-right: 8px;
}

.comment-date {
  font-size: 12px;
  color: #606060;
}

.comment-text {
  font-size: 14px;
  color: #0f0f0f;
  line-height: 1.4;
  margin: 0;
}
</style>
