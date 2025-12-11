import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const accesstToken = ref(null);

  const login = (userData) => {
    isLoggedIn.value = true;
    accesstToken.value = userData;
    // Persist to localStorage if needed, but for now just state
  };

  const logout = () => {
    isLoggedIn.value = false;
    accesstToken.value = null;
    localStorage.removeItem('accessToken');
  };

  return { isLoggedIn, accesstToken, login, logout };
}, { persist: true });
