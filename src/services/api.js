import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
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

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// export const userService = {
//   getProfile: () => api.get('/users/profile'),
//   updateProfile: (data) => api.put('/users/profile', data),
//   changePassword: (data) => api.put('/users/change-password', data),
//   getUsers: (params) => api.get('/users', { params }),
//   createUser: (data) => api.post('/users', data),
//   updateUser: (id, data) => api.put(`/users/${id}`, data),
//   deleteUser: (id) => api.delete(`/users/${id}`),
// };

export default api; 