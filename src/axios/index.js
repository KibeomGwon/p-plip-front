import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        const token = useAuthStore().accessToken;
        if (useAuthStore().isLoggedIn && token) {
            config.headers.Authorization = `Bearer ${token}`;
            // console.log("token", token);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let refreshSubscribers = [];

const addRefreshSubscribers = (callback) => {
    refreshSubscribers.push(callback);
}

api.interceptors.response.use(
    async (response) => {
        const res = response.data;
        const originalRequest = response.config;

        // console.log(originalRequest.headers.Authorization);
        // console.log(res);

        if (res.success) {
            return res.data;
        }

        if (Math.floor(res.code / 100) === 4 && !originalRequest._retry) {
            if (isRefreshing) {
                const retryRequest = new Promise((resolve, reject) => {
                    addRefreshSubscribers((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    });
                });
                return retryRequest;
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }); // cookie에 값이 들어가 있음.

                const data = res.data.data;

                localStorage.setItem('accessToken', data.accessToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
                useAuthStore().login(data.accessToken);

                // console.log("refreshed accessToken", data.accessToken);
                refreshSubscribers.forEach(callback => callback(data.accessToken));
                refreshSubscribers = [];

                console.log("refreshed tokens");

                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (error) {
                console.error("토큰 재발급 실패:", error);
                localStorage.removeItem('accessToken');
                useAuthStore().logout();
                window.location.href = '/login';
                throw error;
            } finally {
                isRefreshing = false;
            }

        }

        console.error("API Business Error:", res);
        return Promise.reject(res);
    },
    (error) => {
        console.error("API Network Error:", error);
        return Promise.reject(error);
    }
);



export default api;