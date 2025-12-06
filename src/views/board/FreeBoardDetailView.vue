<template>
  <div class="detail-container">
    <!-- Header -->
    <div class="detail-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 19L8 12L15 5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h2 class="header-title">게시글</h2>
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
  title: '갑자기 떠난 강릉 바다 후기',
  author: '바다여행자',
  avatarColor: '#E0C3A5',
  likes: 128,
  content: '갑자기 바다가 보고 싶어서 떠난 강릉 여행! 날씨도 너무 좋고 바다 색깔도 너무 예뻤어요. 맛있는 커피도 마시고 힐링 제대로 하고 왔습니다. 다음에는 친구들이랑 같이 오고 싶네요.',
  date: '2시간 전',
  images: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519046904884-53103b34b271?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  commentsList: [
    { id: 1, author: '여행조아', text: '우와 바다 색깔 진짜 예쁘네요!' },
    { id: 2, author: '강릉토박이', text: '안목해변인가요? 커피거리 좋죠 ㅎㅎ' },
    { id: 3, author: '떠나고싶다', text: '저도 가고 싶어요 ㅠㅠ 부럽습니다' }
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
  console.log('Fetching post', route.params.id);
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
