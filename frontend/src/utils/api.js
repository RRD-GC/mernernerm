// axios-config.js
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// REQUEST INTERCEPTOR: Attach token to all requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Handle global errors (e.g., unauthorized access)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Handle token-related errors globally
      if (status === 401 || status === 403) {
        console.warn('⚠️ Session expired or unauthorized. Redirecting to login.');

        // Clear invalid token from localStorage
        localStorage.removeItem('user');

        // Optionally, redirect user to login page (if using react-router)
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
