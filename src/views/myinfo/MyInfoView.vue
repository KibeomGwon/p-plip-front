<template>
  <div class="my-info-container">
    <div class="content-wrapper">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="avatar-wrapper">
          <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Profile" class="avatar-img">
        </div>
        <div class="profile-text">
          <h2 class="user-name">탐험가 Alex</h2>
          <p class="user-status">5개 도시 여행 중</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-value">3</span>
          <span class="stat-label">내 플랜</span>
        </div>
        <div class="stat-card">
          <span class="stat-value text-sm">부산 맛집 탐방기</span>
          <span class="stat-label">최근 플랜</span>
        </div>
      </div>

      <!-- Action Button -->
      <button class="action-btn" @click="$router.push({ name: 'my-plans' })">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="btn-icon">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 16L16 12L12 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 12H16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        내 플랜
      </button>

      <div class="divider"></div>

      <!-- Menu List -->
      <div class="menu-section" style="margin-bottom: 30px;">
        <h3 class="section-title">더보기</h3>
        <ul class="menu-list">
          <li class="menu-item" @click="$router.push({ name: 'my-posts' })">
            <div class="menu-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4V20H20V14" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.5L21.5 5.5L13 14L10 14L10 11L18.5 2.5Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="menu-text">내가 쓴 글</span>
            <svg class="arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </li>
          <li class="menu-item" @click="$router.push({ name: 'profile-edit' })">
            <div class="menu-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="menu-text">프로필 수정</span>
            <svg class="arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </li>
          <li class="menu-item">
            <div class="menu-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19.4 15C20.0627 14.0727 20.4182 12.9463 20.4182 11.8C20.4182 10.6537 20.0627 9.52729 19.4 8.6L21.4 7.4C22.3444 8.71856 22.8485 10.2796 22.8485 11.8C22.8485 13.3204 22.3444 14.8814 21.4 16.2L19.4 15ZM12 23C10.8537 23 9.72729 22.6444 8.8 21.9818L10 19.9818C10.6091 20.4182 11.3 20.6545 12 20.6545C12.7 20.6545 13.3909 20.4182 14 19.9818L15.2 21.9818C14.2727 22.6444 13.1463 23 12 23ZM4.6 15L2.6 16.2C1.65558 14.8814 1.15152 13.3204 1.15152 11.8C1.15152 10.2796 1.65558 8.71856 2.6 7.4L4.6 8.6C3.93727 9.52729 3.58182 10.6537 3.58182 11.8C3.58182 12.9463 3.93727 14.0727 4.6 15ZM12 1C13.1463 1 14.2727 1.35558 15.2 2.01818L14 4.01818C13.3909 3.58182 12.7 3.34545 12 3.34545C11.3 3.34545 10.6091 3.58182 10 4.01818L8.8 2.01818C9.72729 1.35558 10.8537 1 12 1Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="menu-text">설정</span>
            <svg class="arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </li>
        </ul>
      </div>
      <div class="divider"></div>

      <!-- Login/Signup Buttons (Show only when NOT logged in) -->
      <div v-if="!authStore.isLoggedIn">
        <button class="login-btn" @click="$router.push({ name: 'login' })">
          로그인
        </button>
        <button class="signup-btn" @click="goToSignup">회원가입</button>
      </div>

      <!-- Logout Button (Show only when logged in) -->
      <button v-else class="logout-btn" @click="handleLogout">
        로그아웃
      </button>
    </div>

    <!-- Bottom Navigation -->
    <div class="bottom-nav">
      <nav-bar></nav-bar>
    </div>

    <!-- Chat Modal -->
    <ChatModal />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import NavBar from '@/components/common/Navbar.vue';
import ChatModal from '@/components/common/ChatModal.vue';

const router = useRouter();
const authStore = useAuthStore();

const goToSignup = () => {
  console.log('Navigate to signup');
  router.push({ name: 'signup' });
};

const handleLogout = () => {
  const confirmLogout = confirm('로그아웃 하시겠습니까?');
  if (confirmLogout) {
    authStore.logout();
    alert('로그아웃 되었습니다.');
    router.push({ name: 'main' });
  }
};
</script>

<style scoped>
.my-info-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: white;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  padding-bottom: 100px; /* Space for bottom nav */
}

/* Custom Scrollbar removed - handled globally */

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  margin-bottom: 30px;
}

.avatar-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.user-status {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  background: white;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.stat-value.text-sm {
  font-size: 18px;
}

.stat-label {
  font-size: 13px;
  color: #888;
}

.action-btn {
  width: 100%;
  padding: 16px;
  background: #87CEEB; /* Sky blue */
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(135, 206, 235, 0.3);
  transition: transform 0.2s;
}

.action-btn:active {
  transform: scale(0.98);
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: #56B4E9; /* Slightly darker sky blue */
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(86, 180, 233, 0.3);
  transition: transform 0.2s;
  margin-bottom: 12px;
}

.login-btn:active {
  transform: scale(0.98);
}

.signup-btn {
  width: 100%;
  padding: 16px;
  background: #87CEEB; /* My Plan button color */
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
}

.signup-btn:active {
  transform: scale(0.98);
}

.logout-btn {
  width: 100%;
  padding: 16px;
  background: #FF8A80; /* Light Red */
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 4px 12px rgba(255, 138, 128, 0.3);
}

.logout-btn:active {
  transform: scale(0.98);
}

.divider {
  height: 1px;
  background: #eee;
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
}

.menu-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-text {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  height: calc(60px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 30;
  background: white;
  border-top: 1px solid #eee;
}
</style>