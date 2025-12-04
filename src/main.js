import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useKakao } from 'vue3-kakao-maps';
import { createPinia } from 'pinia'

const { VITE_KAKAO_MAP_KEY } = import.meta.env;

useKakao(VITE_KAKAO_MAP_KEY);
console.log('Kakao Map Key:', VITE_KAKAO_MAP_KEY ? 'Loaded' : 'Missing');

const app = createApp(App)

const pinia = createPinia();

app.use(pinia)
app.use(router)

app.mount('#app')
