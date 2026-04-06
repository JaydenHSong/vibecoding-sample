// Design Ref: §4.2 — axios instance with JWT interceptor
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use replaceState to avoid full page reload in SPA
      if (window.location.pathname !== '/login') {
        window.history.replaceState(null, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
    return Promise.reject(err);
  }
);

export default api;
