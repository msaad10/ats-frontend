import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode the token to get user info
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          token,
          id: tokenPayload.id,
          email: tokenPayload.email,
          role: tokenPayload.role,
          name: tokenPayload.name
        });
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      // Decode token to get user info
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userData = {
        token,
        id: tokenPayload.id,
        email: tokenPayload.email,
        role: tokenPayload.role,
        name: tokenPayload.name
      };
      setUser(userData);

      // Redirect based on role
      switch (userData.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'RECRUITER':
        case 'INTERVIEWER':
          navigate('/dashboard');
          break;
        case 'CANDIDATE':
          navigate('/candidate-dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      // Decode token to get user info
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const newUser = {
        token,
        id: tokenPayload.id,
        email: tokenPayload.email,
        role: tokenPayload.role,
        name: tokenPayload.name
      };
      setUser(newUser);

      // Redirect based on role
      switch (newUser.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'RECRUITER':
        case 'INTERVIEWER':
          navigate('/dashboard');
          break;
        case 'CANDIDATE':
          navigate('/candidate-dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 