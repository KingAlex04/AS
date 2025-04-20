import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/config';

// Create auth context
export const AuthContext = createContext();

// Create custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load token from localStorage on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          setToken(storedToken);

          // Get user data
          const res = await axios.get(`${API_URL}/api/auth/me`);
          setUser(res.data.user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Login user
  const login = async (email, password, apiUrl = API_URL) => {
    setLoading(true);
    setError(null);
    
    console.log(`Attempting login for ${email} to ${apiUrl}/api/auth/login`);
    
    try {
      const res = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
      console.log('Login response:', res.data);

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        console.log('Login successful, user data:', res.data.user);
      } else {
        console.error('Login unsuccessful:', res.data);
        setError(res.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error details:', err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', err.message);
        setError(`Error: ${err.message}`);
      }
    }
    setLoading(false);
  };

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, userData);

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  // Register company with admin
  const registerCompany = async (companyData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/api/auth/register-company`, companyData);

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }
    } catch (err) {
      console.error('Register company error:', err);
      setError(err.response?.data?.message || 'Company registration failed. Please try again.');
    }
    setLoading(false);
  };

  // Update user information
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        loading,
        error,
        login,
        register,
        registerCompany,
        updateUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 