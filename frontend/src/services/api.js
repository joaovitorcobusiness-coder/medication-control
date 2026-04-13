import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adicionar token às requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
};

// User endpoints
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getStats: () => api.get('/users/stats'),
};

// Medication endpoints
export const medicationAPI = {
  list: () => api.get('/medications'),
  get: (id) => api.get(`/medications/${id}`),
  create: (data) => api.post('/medications', data),
  update: (id, data) => api.put(`/medications/${id}`, data),
  delete: (id) => api.delete(`/medications/${id}`),
};

// Schedule endpoints
export const scheduleAPI = {
  list: () => api.get('/schedules'),
  getToday: () => api.get('/schedules/today'),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
};

// History endpoints
export const historyAPI = {
  list: (startDate, endDate) => api.get('/history', { params: { start_date: startDate, end_date: endDate } }),
  markTaken: (data) => api.post('/history/mark-taken', data),
  markMissed: (data) => api.post('/history/mark-missed', data),
  getSummary: (month, year) => api.get('/history/summary/monthly', { params: { month, year } }),
  clearAll: () => api.delete('/history/clear'),
};

// IoT endpoints
export const iotAPI = {
  registerDevice: (data) => api.post('/iot/devices/register', data),
  listDevices: () => api.get('/iot/devices'),
  deleteDevice: (deviceId) => api.delete(`/iot/devices/${deviceId}`),
  scheduleNotification: (data) => api.post('/iot/notifications/schedule', data),
  sendNotificationNow: (data) => api.post('/iot/notifications/send-now', data),
  listNotifications: () => api.get('/iot/notifications'),
};

export default api;
