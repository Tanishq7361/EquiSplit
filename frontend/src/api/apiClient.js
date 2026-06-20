import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 200000,
});

// Request interceptor — attach JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalise errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    let message;
    if (error.code === "ECONNABORTED") {
      message =
        "Now Try Again 😅 it will work";
    } else if (!error.response) {
      message =
        "Please check your internet connection and try again.";
    } else {
      message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "An unexpected error occurred";
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
