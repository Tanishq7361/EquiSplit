import apiClient from './apiClient';

const dashboardApi = {
    getOutstandingBalance: () =>
        apiClient.get('/dashboard/outstanding')
};

export default dashboardApi;