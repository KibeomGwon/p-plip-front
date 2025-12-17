import api from "./index";

export const boardApi = {
    postFreeBoard: (data) => api.post("/freeboard", data),
    updateFreeBoard: (id, data) => api.put(`/freeboard/${id}`, data),
    deleteFreeBoard: (id) => api.delete(`/freeboard/${id}`),
    getFreeBoardList: (sort) => api.get("/freeboard", { params: { sort: sort } }),
    getFreeBoardDetail: (id) => api.get(`/freeboard/${id}`),
    getMyPostFreeBoardList: (sort) => api.get("/freeboard/my-post", { params: { sort: sort } }),
    getFreeBoardComments: (id, params) => api.get(`/freeboard/${id}/comment`, { params }),
    postFreeBoardComment: (id, data) => api.post(`/freeboard/${id}/comment`, data),
    updateFreeBoardComment: (id, data) => api.put(`/freeboard/comment/${id}`, data),
    deleteFreeBoardComment: (id) => api.delete(`/freeboard/comment/${id}`),
    getLikeFreeBoard: (id) => api.get(`/freeboard/${id}/like`),
    likeFreeBoard: (id) => api.post(`/freeboard/${id}/like`),
    unlikeFreeBoard: (id) => api.delete(`/freeboard/${id}/like`),

    getNoticeBoardList: () => api.get("/notice"),
    getNoticeBoardDetail: (id) => api.get(`/notice/${id}`),
    postNoticeBoard: (data) => api.post("/notice", data),
    updateNoticeBoard: (id, data) => api.put(`/notice/${id}`, data),
    deleteNoticeBoard: (id) => api.delete(`/notice/${id}`),
    getNoticeBoardComments: (id, pageNo) => api.get(`/notice/${id}/comment`, { params: { pageNo } }),
    postNoticeBoardComment: (id, data) => api.post(`/notice/${id}/comment`, data),
    updateNoticeBoardComment: (id, data) => api.put(`/notice/comment/${id}`, data),
    deleteNoticeBoardComment: (id) => api.delete(`/notice/comment/${id}`),
    getMyPostNoticeBoardList: () => api.get("/notice/my-post"),
}