import apiClient from './apiClient';

const expensesApi = {
  createExpense: (groupId, data) => apiClient.post(`/groups/${groupId}/expenses`, data),
  getExpenses:   (groupId)       => apiClient.get(`/groups/${groupId}/expenses`),
  getBalances:   (groupId)       => apiClient.get(`/groups/${groupId}/expenses/balances`),

  deleteExpense: (groupId, expenseId) =>
  apiClient.delete(`/groups/${groupId}/expenses/${expenseId}`),
  getDebts: (groupId) =>
    apiClient.get(`/groups/${groupId}/expenses/debts`),

  getExpense(groupId, expenseId) {
      return apiClient.get(
          `/groups/${groupId}/expenses/${expenseId}`
      );
  },
  
  updateExpense(groupId, expenseId, data) {
      return apiClient.put(
          `/groups/${groupId}/expenses/${expenseId}`,
          data
      );
  },

  
};

export default expensesApi;
