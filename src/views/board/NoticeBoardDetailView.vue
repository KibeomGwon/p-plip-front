<template>
  <div class="detail-container">
    <!-- Header -->
    <div class="detail-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 19L8 12L15 5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h2 class="header-title">공지사항</h2>
      <div class="header-spacer"></div>
    </div>

    <div class="content-scroll">
      <BoardDetailContent :post="post" />
      <BoardDetailComment 
        :comments="post.commentsList" 
        @add-comment="handleAddComment"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BoardDetailContent from '@/components/board/detail/BoardDetailContent.vue';
import BoardDetailComment from '@/components/board/detail/BoardDetailComment.vue';

const route = useRoute();
const post = ref({
  id: 1,
  title: '서비스 점검 안내',
  author: '관리자',
  avatarColor: '#333',
  likes: 54,
  content: '안녕하세요, P-PliP 팀입니다. 더 나은 서비스를 위해 서버 점검이 진행될 예정입니다. 이용에 불편을 드려 죄송합니다.',
  date: '2023.12.06',
  images: [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  commentsList: [
    { id: 1, author: '사용자1', text: '확인했습니다.' },
    { id: 2, author: '사용자2', text: '언제 끝나나요?' }
  ]
});

const handleAddComment = (text) => {
  const newComment = {
    id: post.value.commentsList.length + 1,
    author: '나', // Mock current user
    text: text
  };
  post.value.commentsList.unshift(newComment);
};

// In a real app, fetch post details using route.params.id
onMounted(() => {
  console.log('Fetching notice', route.params.id);
  // Mock data fetching logic here if needed
});
</script>

<style scoped>
.detail-container {
  background: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.back-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.header-spacer {
  width: 32px; /* Balance back button */
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 40px;
}
</style>