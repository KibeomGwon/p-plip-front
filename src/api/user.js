import api from "./index";

export const userApi = {
    login: (data) => api.post("/auth/login", data),
    logout: () => api.post("/user/logout"),
    getMyInfo: () => api.get("/user/my-info"),
    sendEmailCheckCode: (data) => api.post("/user/join/send-verification-email", data),
    checkEmailCode: (data) => api.post("/user/join/verification-email", data),
    register: (data) => api.post("/user/join", data),
    nicknameDupCheck: (data) => api.get("/user/join/nickname-dupcheck", {params: data}),
};