import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  // Function to login
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Store user info and token
      setUserInfo(user);
      setUserToken(token);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      
      // Set default authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to login. Please check your credentials.';
      setError(message);
    }
    
    setIsLoading(false);
  };

  // Function to register a user
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, userData);
      
      const { token, user } = response.data;
      
      // Store user info and token
      setUserInfo(user);
      setUserToken(token);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      
      // Set default authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to register. Please try again.';
      setError(message);
    }
    
    setIsLoading(false);
  };

  // Function to logout
  const logout = async () => {
    setIsLoading(true);
    
    // Remove from AsyncStorage
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
    
    // Reset state
    setUserToken(null);
    setUserInfo(null);
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    setIsLoading(false);
  };

  // Check if user is already logged in on app start
  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      
      // Check AsyncStorage for token and user info
      const token = await AsyncStorage.getItem('userToken');
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      
      if (token) {
        setUserToken(token);
        
        // Set default authorization header for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        if (userInfoStr) {
          setUserInfo(JSON.parse(userInfoStr));
        }
      }
      
    } catch (error) {
      console.log('Error checking authentication state:', error);
    }
    
    setIsLoading(false);
  };

  // Check authentication state on app start
  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isLoading, 
      userToken, 
      userInfo, 
      error, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 