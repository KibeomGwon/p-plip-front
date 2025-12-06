<template>
  <div class="free-board-container">
    <!-- Filters -->
    <div class="filter-chips">
      <button 
        class="chip" 
        :class="{ active: activeFilter === 'popular' }"
        @click="activeFilter = 'popular'"
      >
        인기순
      </button>
      <button 
        class="chip" 
        :class="{ active: activeFilter === 'latest' }"
        @click="activeFilter = 'latest'"
      >
        최신순
      </button>
    </div>

    <!-- Grid -->
    <div class="post-grid">
      <div 
        v-for="post in posts" 
        :key="post.id" 
        class="post-card"
        @click="goToDetail(post.id)"
      >
        <div class="card-image" :style="{ backgroundImage: `url(${post.image})` }">
          <button class="more-btn" @click.stop>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="card-content">
          <h3 class="post-title">{{ post.title }}</h3>
          
          <div class="post-meta">
            <div class="author-info">
              <div class="author-avatar" :style="{ backgroundColor: post.avatarColor }">
                <img v-if="post.avatarImage" :src="post.avatarImage" alt="Author" class="avatar-img">
                <span v-else class="avatar-initial">{{ post.author[0] }}</span>
              </div>
              <span class="author-name">{{ post.author }}</span>
            </div>
            
            <div class="interaction-info">
              <div class="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.64169 1.54871 7.04096 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61V4.61Z" stroke="#FF6B6B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ post.likes }}</span>
              </div>
              <div class="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ post.comments }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Write FAB -->
    <button class="write-fab" @click="goToWrite">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeFilter = ref('popular');

const goToWrite = () => {
  router.push({ name: 'freeboard-write' });
};
const goToDetail = (id) => {
  router.push({ name: 'freeboard-detail', params: { id } });
};

const posts = ref([
  {
    id: 1,
    title: '갑자기 떠난 강릉 바다 후기',
    author: '바다여행자',
    avatarColor: '#E0C3A5',
    likes: 128,
    comments: 12,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 2,
    title: '즉흥적으로 들어간 카페가 인생 카페',
    author: '카페인중독',
    avatarColor: '#FFB7B2',
    avatarImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    likes: 201,
    comments: 35,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 3,
    title: '오늘 발견한 동네 숨은 맛집',
    author: '맛잘알',
    avatarColor: '#E2F0CB',
    avatarImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    likes: 99,
    comments: 23,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 4,
    title: '나만 알고 싶은 서울 야경 스팟',
    author: '야경헌터',
    avatarColor: '#C7CEEA',
    likes: 87,
    comments: 9,
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 5,
    title: '계획 없이 온 제주도 3일차',
    author: '제주앓이',
    avatarColor: '#FFDAC1',
    likes: 42,
    comments: 5,
    image: 'https://images.unsplash.com/photo-1542332205-4da5d5d19266?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 6,
    title: '퇴근 후 급번개로 한강 치맥',
    author: '칼퇴요정',
    avatarColor: '#B5EAD7',
    likes: 155,
    comments: 18,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  }
]);
</script>

<style scoped>
.free-board-container {
  padding: 20px;
}

.filter-chips {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.chip {
  padding: 8px 16px;
  background: #f0f0f0;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.chip.active {
  background: #87CEEB; /* Sky blue */
  color: white;
  font-weight: 600;
}

.post-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: row;
  height: 120px; /* Fixed height for horizontal card */
}

.card-image {
  width: 120px; /* Fixed width */
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  flex-shrink: 0;
}

.more-btn {
  position: absolute;
  top: 8px;
  left: 8px; /* Moved to left since image is on left */
  right: auto;
  background: rgba(0,0,0,0.3);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.card-content {
  padding: 12px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0; /* Prevent flex child overflow */
}

.post-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.author-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 10px;
  color: #555;
  font-weight: bold;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-name {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.interaction-info {
  display: flex;
  gap: 12px;
  margin-top: auto; /* Push to bottom */
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #888;
}

.write-fab {
  position: absolute;
  bottom: calc(80px + env(safe-area-inset-bottom));
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #00BFFF; /* Bright blue for + button */
  border: none;
  box-shadow: 0 4px 12px rgba(0,191,255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 35; /* Below Chat FAB (40) if both exist, or maybe Chat FAB should be higher? */
  cursor: pointer;
  transition: transform 0.2s;
}

.write-fab:active {
  transform: scale(0.95);
}
</style>