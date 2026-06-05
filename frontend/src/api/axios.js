import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aw_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — but never redirect if already on an auth page
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const authPages = ['/login', '/register'];
      const isAuthPage = authPages.some((p) => window.location.pathname.startsWith(p));
      if (!isAuthPage) {
        localStorage.removeItem('aw_token');
        localStorage.removeItem('aw_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
