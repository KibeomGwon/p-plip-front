import axios from "axios";


const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 5000,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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

        if (res.success) {
            return res.data;
        } 

        if (res.code / 100 === 4 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    addRefreshSubscribers((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const {data} = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/refresh`, 
                    {}, 
                    {withCredentials: true}); // cookie에 값이 들어가 있음.
                
                localStorage.setItem('accessToken', data.accessToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

                refreshSubscribers.forEach(callback => callback(data.accessToken));
                refreshSubscribers = [];

                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (error) {
                console.error("토큰 재발급 실패:", error);
                localStorage.removeItem('accessToken');

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