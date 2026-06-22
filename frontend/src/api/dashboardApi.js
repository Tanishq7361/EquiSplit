import apiClient from "./apiClient";

const dashboardApi = {
    getDashboard: () => apiClient.get("/dashboard"),
    getCategorySummary: () =>
        apiClient.get("/dashboard/category-summary"),
    getMonthlySummary() {
        return apiClient.get("/dashboard/monthly-summary");
    },
};


export default dashboardApi;