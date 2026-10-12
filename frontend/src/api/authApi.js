import apiClient from './apiClient';

const authApi = {
  register:       (data) => apiClient.post('/auth/register', data),
  login:          (data) => apiClient.post('/auth/login', data),
  googleLogin:    (data) => apiClient.post('/auth/google', data),
  changeUsername: (data) => apiClient.patch('/users/username', data),
  getProfile:     () => apiClient.get('/users/me'),
  updateProfile:  (data) => apiClient.patch('/users/profile', data),
};

export default authApi;

