import apiClient from './apiClient';

const expensesApi = {
  createExpense: (groupId, data) => apiClient.post(`/groups/${groupId}/expenses`, data),
  getExpenses:   (groupId)       => apiClient.get(`/groups/${groupId}/expenses`),
  getBalances:   (groupId)       => apiClient.get(`/groups/${groupId}/expenses/balances`),
};

export default expensesApi;
