<template>
  <div class="detail-container">
    <!-- Header -->
    <div class="detail-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 19L8 12L15 5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h2 class="header-title">게시판</h2>
      <div class="header-actions" v-if="post && post.author">
        <button class="action-btn edit-btn" @click="handleEdit">수정</button>
        <button class="action-btn delete-btn" @click="handleDelete">삭제</button>
      </div>
      <div v-else class="header-spacer"></div>
    </div>

    <div class="content-scroll" v-if="post" @scroll="handleScroll">
      <BoardDetailContent :post="post" :isLiked="isLiked" />
      <BoardDetailComment 
        :comments="commentList" 
        :commentPageInfo="commentPageInfo"
        @add-comment="handleAddComment"
        @edit-comment="handleEditComment"
        @delete-comment="handleDeleteComment"
      />
    </div>
    <div v-else class="loading-container">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BoardDetailContent from '@/components/board/detail/BoardDetailContent.vue';
import BoardDetailComment from '@/components/board/detail/BoardDetailComment.vue';
import { boardApi } from '@/api/board';
import { fileApi } from '@/api/file';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const post = ref(null);
const boardId = ref(null);
const commentList = ref([]);
const commentPageInfo = ref({
    pageNum: 1,
    pageSize: 10,
    totalCount: 0,
    totalPage: 0,
    startPage: 0,
    endPage: 0,
    prev: false,
    next: false
});
const isCommentLoading = ref(false);
const isLiked = ref(false);

onMounted(() => {
  boardId.value = route.params.id;
  getBoardDatas();
  getBoardCommentDatas();
  getLikeFreeBoard();
});

const getLikeFreeBoard = () => {
  if (!useAuthStore().isLoggedIn) 
    return;
  boardApi.getLikeFreeBoard(boardId.value).then(res => {
    isLiked.value = res.like;
    console.log(res.like)
  }).catch(err => {
    console.error(err);
    alert(err.message);
    if (err.code === 201) {
      router.back();
    }
  });
}

const getBoardDatas = () => {
  boardApi.getFreeBoardDetail(boardId.value).then(res => {
    post.value = res;
  }).catch(err => {
    console.error(err);
    alert(err.message);
    if (err.code === 201) {
      router.back();
    }
  });
}

const getBoardCommentDatas = async () => {
  if (isCommentLoading.value) return;
  isCommentLoading.value = true;
  
  try {
      const res = await boardApi.getFreeBoardComments(boardId.value, { 
          pageNum: commentPageInfo.value.pageNum,
          pageSize: 10 
      });
      
      console.log(res);
      
      if (commentPageInfo.value.pageNum === 1) {
          commentList.value = res.list;
      } else {
          commentList.value = [...commentList.value, ...res.list];
      }
      
      commentPageInfo.value = {
        pageNum: res.pageNum || res.pageNo,
        pageSize: res.pageSize,
        totalCount: res.totalCount,
        totalPage: res.totalPage,
        startPage: res.startPage,
        endPage: res.endPage,
        prev: res.prev,
        next: res.next
      };

      console.log(commentList.value);
      console.log(commentPageInfo.value);
  } catch (err) {
    console.error(err);
    alert(err.message);
  } finally {
    isCommentLoading.value = false;
  }
}

const handleEdit = () => {
  router.push({ name: 'freeboard-modify', params: { id: boardId.value }});
};

const handleDelete = async () => {
  if(!confirm("정말로 삭제하시겠습니까?")) return;
  try {
    console.log(post.value.id);
    await boardApi.deleteFreeBoard(post.value.id);
    post.value.freeBoardImages.forEach(async (img) => {
      await fileApi.deleteFile(img.id, "FREE_BOARD");
    })
    alert("성공적으로 삭제되었습니다.");
    router.back();
  } catch (e) {
    console.log(e);
    alert("삭제 실패");
  }
};

const handleAddComment = async (text) => {
  const newComment = {
    content: text,
  };
  
  console.log(newComment);

  try {
    await boardApi.postFreeBoardComment(post.value.id, newComment);
    
    // Reset pagination to first page
    commentPageInfo.value = {
        pageNum: 1,
        pageSize: 10,
        totalCount: 0,
        totalPage: 0,
        startPage: 0,
        endPage: 0,
        prev: false,
        next: false
    };

    // Fetch comments again
    await getBoardCommentDatas();
    console.log("called post");

  } catch (error) {
    console.log(error);
    alert(error.message);
  }
};

const handleEditComment = async (comment) => {
  try {
    await boardApi.updateFreeBoardComment(comment.id, { content: comment.content });
    // Refresh comments
    await getBoardCommentDatas();
  } catch (error) {
    console.error(error);
    alert(error.message || "댓글 수정 실패");
  }
};

const handleDeleteComment = async (commentId) => {
  try {
    await boardApi.deleteFreeBoardComment(commentId);
    // Refresh comments
    await getBoardCommentDatas();
  } catch (error) {
    console.error(error);
    alert(error.message || "댓글 삭제 실패");
  }
};

const handleScroll = (e) => {
  const { scrollTop, clientHeight, scrollHeight } = e.target;
  console.log(`Scroll: top=${scrollTop}, client=${clientHeight}, scrollHeight=${scrollHeight}, sum=${scrollTop + clientHeight}`);
  
  // Trigger when close to bottom (e.g., 50px threshold)
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    console.log("Bottom reached!");
    console.log(`Next: ${commentPageInfo.value.next}, Loading: ${isCommentLoading.value}`);
    if (commentPageInfo.value.next && !isCommentLoading.value) {
        console.log("Fetching next page...");
        commentPageInfo.value.pageNum++;
        getBoardCommentDatas();
    }
  }
};
</script>

<style scoped>
.detail-container {
  background: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  touch-action: none; /* Prevent whole page drag */
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
  z-index: 1; /* ensure it's above title if overlap */
}

.header-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
}

.header-spacer {
  width: 32px; /* Balance back button */
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.edit-btn {
  color: #0095f6;
}

.delete-btn {
  color: #ff3b30;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 40px;
  touch-action: pan-y; /* Allow vertical scrolling */
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.3) transparent;
}

.content-scroll::-webkit-scrollbar {
  width: 6px;
}

.content-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.content-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.3);
  border-radius: 3px;
}

.content-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0,0,0,0.5);
}

.loading-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
