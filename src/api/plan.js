import api from "./index";

export const planApi = {
    suggestPlan: (attractionId, query = "") => api.post("/trip/plan/suggest", {
        "attraction_id": attractionId,
        "user_theme": query
    }, {
        timeout: 60000 // 60 seconds timeout for AI generation
    }),
    getPlans: (params) => api.get("/trip/plan", { params }),
    getPlanDetails: (planId) => api.get(`/trip/plan/${planId}/todo`),
    updatePlanDetails: (planId, todoList) => api.put(`/trip/plan/${planId}/todo`, todoList),
    deletePlan: (planId) => api.delete(`/trip/plan/${planId}`)
};
