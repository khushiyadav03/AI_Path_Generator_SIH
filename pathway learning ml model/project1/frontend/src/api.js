// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  withCredentials: true,
});

// DEBUG: Log every request to prove interceptor runs
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    console.log('[API] Sending request:', config.method.toUpperCase(), config.url);
    console.log('[API] Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API] Authorization header added');
    } else {
      console.warn('[API] NO TOKEN FOUND');
    }
    return config;
  },
  (error) => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

export default api;