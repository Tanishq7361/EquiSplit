import apiClient from './apiClient';

const authApi = {
  register: (data) => apiClient.post('/auth/register', data),
  login:    (data) => apiClient.post('/auth/login', data),
};

export default authApi;
