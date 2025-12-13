import { ref } from 'vue';
import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const accessToken = ref(null);
  const userRole = ref(null);

  const login = (token) => {
    isLoggedIn.value = true;
    accessToken.value = token;

    try {
      // 1. 토큰 디코딩
      const decoded = jwtDecode(token);

      userRole.value = decoded.role;
    } catch (error) {
      console.error('토큰 형식이 올바르지 않습니다.', error);
    }

    localStorage.setItem('accessToken', token);
  };

  const logout = () => {
    isLoggedIn.value = false;
    accessToken.value = null;
    localStorage.removeItem('accessToken');

    userRole.value = null;
  };

  return { isLoggedIn, accessToken, userRole, login, logout };
}, { persist: true });
