import React, { createContext, useState, useContext, useEffect } from 'react';
import { useInRouterContext, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = parseJwt(token);
        setUser({
          id: decodedToken.userId,
          firstName: decodedToken.firstName,
          lastName: decodedToken.lastName,
          email: decodedToken.email,
          role: decodedToken.role
        });
      } catch (error) {
        console.error('Error parsing token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      const decodedToken = parseJwt(token);
      const userData = {
        id: decodedToken.userId,
        userName: decodedToken.userName,
        // email: decodedToken.email,
        role: decodedToken.role
      };
      setUser(userData);

      console.log(decodedToken, "decodedToken")
      // Redirect based on role
      switch (decodedToken.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'RECRUITER':
          navigate('/recruiter/dashboard');
          break;
        case 'INTERVIEWER':
          navigate('/interviewer/dashboard');
          break;
        case 'CANDIDATE':
          navigate('/candidate/dashboard');
          break;
        default:
          navigate('/');
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
      
      const decodedToken = parseJwt(token);
      const newUserData = {
        id: decodedToken.userId,
        firstName: decodedToken.firstName,
        lastName: decodedToken.lastName,
        email: decodedToken.email,
        role: decodedToken.role
      };
      setUser(newUserData);

      navigate('/login');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 