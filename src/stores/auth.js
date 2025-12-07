import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const user = ref(null);

  const login = (userData) => {
    isLoggedIn.value = true;
    user.value = userData;
    // Persist to localStorage if needed, but for now just state
  };

  const logout = () => {
    isLoggedIn.value = false;
    user.value = null;
  };

  return { isLoggedIn, user, login, logout };
});
