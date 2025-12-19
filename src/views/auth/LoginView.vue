<template>
  <div class="login-container">
    <div class="header">
      <button class="icon-btn back-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h2 class="header-title">로그인</h2>
      <div class="placeholder"></div>
    </div>

    <div class="content">
      <div class="input-group">
        <label class="label">이메일</label>
        <input type="email" v-model="email" placeholder="이메일을 입력하세요" class="input-field" />
      </div>

      <div class="input-group">
        <label class="label">비밀번호</label>
        <input type="password" v-model="password" placeholder="비밀번호를 입력하세요" class="input-field" @keyup.enter="handleLogin" />
      </div>

      <button class="login-btn" @click="handleLogin">로그인</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { userApi } from '@/axios/user';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const email = ref('');
const password = ref('');

const goToSignup = () => {
  console.log('Navigate to signup');
  router.push({ name: 'signup' });
};

const handleLogin = async () => {
  console.log('Login with:', email.value, password.value);
  userApi.login({ id: email.value, password: password.value })
  .then(res => {
    console.log(res.accessToken);
    authStore.login( res.accessToken );
    
    if (route.query.redirect) {
      // router.push(route.query.redirect);
      router.back();
    } else {
      router.push({ name: 'main' });
    }
  }).catch(err => {
    console.error(err);
    if (err.code==101) {
      alert(err.message);
    }
  });
};


</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: white;
  touch-action: none; /* Prevent whole page drag */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: white;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.icon-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.placeholder {
  width: 24px;
}

.content {
  flex: 1;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto; /* Allow scrolling if content overflows */
  touch-action: pan-y; /* Allow vertical scrolling */
  overscroll-behavior: contain;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.input-field {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 12px;
  font-size: 16px;
  background: #f9f9f9;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #87CEEB;
}

.login-btn {
  margin-top: 24px;
  padding: 16px;
  background: #56B4E9; /* Darker sky blue from MyInfo */
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
}

.login-btn:active {
  transform: scale(0.98);
}


</style>
