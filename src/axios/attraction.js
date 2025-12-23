import api from "./index";

export const attractionApi = {
  getAttractionsBySearch: (query, lat, lng, pageNum, pageSize, m, contentTypes) => api.get("/trip/attraction/search", {
    params: {
      query: query,
      lat: lat,
      lng: lng,
      pageNum: pageNum || 1,
      pageSize: pageSize || 10,
      m: m || 1000,       // m 거리
      contentTypes: contentTypes,
    }
  }),
  getAttractionsBySuggestion: () => api.get("/trip/attraction/ai"),
  getAttractionById: (id) => api.get(`/trip/attraction/${id}`),
  getRegions: () => api.get("/trip/attraction/region"),
  getAttractionsByRegion: (data) => api.get(`/trip/attraction/suggest/sido-guguns`, { params: data }),
  getSearchHistory: (params) => api.get("/trip/attraction/search-history", { params }),
  deleteSearchHistory: (id) => api.delete(`/trip/attraction/search-history/${id}`),
  getMostReviewAttractions: (params) => api.get("/trip/attraction", { params: params}),
};
