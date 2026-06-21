import apiClient from "./apiClient";

const dashboardApi = {
    getDashboard: () => apiClient.get("/dashboard"),
    getCategorySummary: () =>
        apiClient.get("/dashboard/category-summary"),
};


export default dashboardApi;