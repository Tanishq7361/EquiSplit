import apiClient from './apiClient';

const settlementsApi = {
  createSettlement: (groupId, data) => apiClient.post(`/groups/${groupId}/settlements`, data),
  getSettlements:   (groupId)       => apiClient.get(`/groups/${groupId}/settlements`),

  deleteSettlement: (groupId, settlementId) =>
  apiClient.delete(
    `/groups/${groupId}/settlements/${settlementId}`
  ),
};

export default settlementsApi;
