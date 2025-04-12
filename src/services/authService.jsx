import api from "./api";

const authService = {
    login: async (email, password) => {
      try {
        const response = await api.post('/auth/login', { email, password });
        return response;
      } catch (error) {
        throw error;
      }
    },
  
    register: async (userData) => {
      try {
        const response = await api.post('/auth/register', userData);
        return response;
      } catch (error) {
        throw error;
      }
    },
  
    logout: async () => {
      try {
        await api.post('/auth/logout');
      } catch (error) {
        throw error;
      }
    },
  
    refreshToken: async () => {
      try {
        const response = await api.post('/auth/refresh-token');
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
    verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  };

  export default authService;