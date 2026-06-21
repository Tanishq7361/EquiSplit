import apiClient from "./apiClient";

const dashboardApi = {
    getDashboard: () => apiClient.get("/dashboard"),
};

export default dashboardApi;