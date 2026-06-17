import apiClient from './apiClient';

const settlementsApi = {
  createSettlement: (groupId, data) => apiClient.post(`/groups/${groupId}/settlements`, data),
  getSettlements:   (groupId)       => apiClient.get(`/groups/${groupId}/settlements`),
};

export default settlementsApi;
