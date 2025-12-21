import api from "./index";

export const aiApi = {
    postAiRequest: (payload) => api.post("/trip/attraction/suggest", {
        query: payload.query,
        lat: payload.lat,
        lng: payload.lng,
        m: payload.m || 1000,
        k: payload.k || 5,
        contentTypes: payload.contentTypes || []
    }, {
        timeout: 150000
    })

};
