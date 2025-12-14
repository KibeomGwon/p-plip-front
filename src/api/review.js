import api from "./index";

export const reviewApi = {
    postReview: (attractionId, data) => api.post(`/trip/attraction/${attractionId}/review`, data),
    updateReview: (attractionId, data) => api.put(`/trip/attraction/review/${attractionId}`, data),
    deleteReview: (attractionId) => api.delete(`/trip/attraction/review/${attractionId}`),
    getReviewList: (attractionId, pageNo, pageSize, sort) => api.get(`/trip/attraction/${attractionId}/review`, { params: { pageNum: pageNo, pageSize: pageSize, sort: sort } }),
    getMyReviewList: (pageNo, pageSize, sort) => api.get(`/trip/attraction/review/my`, { params: { pageNum: pageNo, pageSize: pageSize, sort: sort } }),
}