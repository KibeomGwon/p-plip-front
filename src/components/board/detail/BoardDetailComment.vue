<template>
  <div class="comments-container">
    <div class="section-divider"></div>
    <div class="comments-header-bar">
      <span class="comments-label">댓글</span>
      <span class="comments-count">{{ commentPageInfo.totalCount }}</span>
    </div>

    <!-- Comment Input Section -->
    <div class="comment-input-section" v-if="authStore.isLoggedIn">

      <div class="input-wrapper">
        <input 
          :value="newComment"
          @input="newComment = $event.target.value"
          type="text" 
          placeholder="댓글을 입력하세요..." 
          class="comment-input"
          @keydown.enter.prevent="submitComment"
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
          <img 
            :src="comment.profileImage ? getImageUrl(comment.profileImage) : defaultImage" 
            alt="User" 
            class="avatar-img"
          >
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">{{ comment.authorNickName }}</span>
            <span class="comment-date" v-if="comment.updatedAt !== null">{{ formatTime(comment.updatedAt) }} 수정됨</span>
            <span class="comment-date" v-else>{{ formatTime(comment.createdAt) }}</span>
            <div class="comment-actions" v-if="comment.author">
              <button class="action-btn" @click="onEdit(comment)">수정</button>
              <button class="action-btn" @click="onDelete(comment)">삭제</button>
            </div>
          </div>
          <p class="comment-text">{{ comment.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

import { useRelativeTime } from '@/composables/useRelativeTime';
import { useImage } from '@/composables/useImage';
import { useDefaultImage } from '@/composables/useDefaultImage';

const authStore = useAuthStore();
const { getImageUrl } = useImage();
const defaultImage = useDefaultImage();
const { formatTime } = useRelativeTime();

const props = defineProps({
  comments: {
    type: Array,
    required: true,
    default: () => []
  },
  commentPageInfo: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const emit = defineEmits(['add-comment', 'delete-comment', 'edit-comment']);
const newComment = ref('');

const submitComment = (e) => {
  if (e && e.isComposing) return;
  if (!newComment.value.trim()) return;
  
  emit('add-comment', newComment.value);
  newComment.value = '';
};

const onEdit = (comment) => {
  // Placeholder for edit functionality
  const newContent = prompt("댓글을 수정하세요:", comment.content);
  if (newContent !== null && newContent.trim() !== "") {
      emit('edit-comment', { ...comment, content: newContent });
  }
};

const onDelete = (comment) => {
  if (confirm("정말로 삭제하시겠습니까?")) {
      emit('delete-comment', comment.id);
  }
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

.comment-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.action-btn {
  font-size: 12px;
  color: #999;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.action-btn:hover {
  text-decoration: underline;
  color: #666;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #f0f0f0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
