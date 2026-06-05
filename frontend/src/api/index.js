import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
};

export const semesterAPI = {
  getAll: () => api.get('/semesters'),
  create: (data) => api.post('/semesters', data),
  update: (id, data) => api.put(`/semesters/${id}`, data),
  delete: (id) => api.delete(`/semesters/${id}`),
  addHoliday: (id, data) => api.post(`/semesters/${id}/holidays`, data),
  removeHoliday: (id, hid) => api.delete(`/semesters/${id}/holidays/${hid}`),
};

export const subjectAPI = {
  getAll: (params) => api.get('/subjects', { params }),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
  getStats: (id) => api.get(`/subjects/${id}/stats`),
  getAnalytics: (params) => api.get('/subjects/analytics', { params }),
};

export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  add: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
  getStats: (params) => api.get('/attendance/stats', { params }),
  getCalendar: (params) => api.get('/attendance/calendar', { params }),
  getPrediction: (params) => api.get('/attendance/prediction', { params }),
  export: (params) => api.get('/attendance/export', { params, responseType: 'blob' }),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};
