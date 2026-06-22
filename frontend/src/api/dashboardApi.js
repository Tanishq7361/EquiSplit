import apiClient from "./apiClient";

const dashboardApi = {
    getDashboard: () => apiClient.get("/dashboard"),
    getCategorySummary: () =>
        apiClient.get("/dashboard/category-summary"),
    getMonthlySummary() {
        return api.get("/dashboard/monthly-summary");
    },
};


export default dashboardApi;