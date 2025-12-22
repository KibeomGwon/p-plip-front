import axios from 'axios';

const routeApi = axios.create({
    baseURL: '/mobility', // Uses the proxy defined in vite.config.js
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add interceptor to inject API key from env
routeApi.interceptors.request.use(config => {
    const apiKey = import.meta.env.VITE_KAKAO_REST_API_KEY;
    if (apiKey) {
        config.headers['Authorization'] = `KakaoAK ${apiKey}`;
    } else {
        console.warn("VITE_KAKAO_REST_API_KEY is missing!");
    }
    return config;
});

export default routeApi;
