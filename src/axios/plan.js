import api from "./index";

export const planApi = {
    suggestPlan: (attractionId, query = "", startDate, endDate) => api.post("/trip/plan/suggest", {
        "attraction_id": attractionId,
        "user_theme": query,
        "start_date": startDate,
        "end_date": endDate
    }, {
        timeout: 60000 // 60 seconds timeout for AI generation
    }),
    suggestRandomPlan: (sidoCode, gugunCode, startDate, endDate, regionName) => api.post("/trip/plan/suggest/random", {
        "sidoCode": sidoCode,
        "gugunCode": gugunCode,
        "startDate": startDate,
        "endDate": endDate,
        "regionName": regionName
    }, {
        timeout: 60000
    }),
    getPlans: (params) => api.get("/trip/plan", { params }),
    getPlanDetails: (planId) => api.get(`/trip/plan/${planId}/todo`),
    updatePlanDetails: (planId, todoList) => api.put(`/trip/plan/${planId}/todo`, todoList),
    deletePlan: (planId) => api.delete(`/trip/plan/${planId}`)
};
