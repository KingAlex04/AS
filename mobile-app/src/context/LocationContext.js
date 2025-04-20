import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { API_URL } from '../config';

// Create location context
export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);
  const [trackingInterval, setTrackingInterval] = useState(null);
  
  const { userToken, userInfo } = useContext(AuthContext);

  // Request location permissions
  const requestLocationPermissions = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return false;
      }
      
      // Also request background permissions
      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus.status !== 'granted') {
        console.log('Background location permission not granted');
      }
      
      return true;
    } catch (error) {
      setErrorMsg('Error requesting location permissions');
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) return;
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      setLocation(location);
      return location;
    } catch (error) {
      setErrorMsg('Error getting current location');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send location to backend
  const sendLocationToServer = async (location, type = 'tracking') => {
    if (!userToken || !userInfo) return;
    
    try {
      const { latitude, longitude } = location.coords;
      
      // Get address if possible
      let address = '';
      try {
        const [addressResult] = await Location.reverseGeocodeAsync({
          latitude,
          longitude
        });
        
        if (addressResult) {
          address = `${addressResult.street || ''}, ${addressResult.city || ''}, ${addressResult.region || ''}, ${addressResult.country || ''}`;
        }
      } catch (error) {
        console.log('Error getting address:', error);
      }
      
      // Create location object
      const locationData = {
        coordinates: {
          latitude,
          longitude
        },
        address,
        type
      };
      
      // Send to server based on type
      let endpoint = '/api/locations';
      if (type === 'checkin') {
        endpoint = '/api/locations/checkin';
      } else if (type === 'checkout') {
        endpoint = '/api/locations/checkout';
      }
      
      const response = await axios.post(`${API_URL}${endpoint}`, locationData);
      
      return response.data;
    } catch (error) {
      console.error('Error sending location to server:', error);
      throw error;
    }
  };

  // Check in functionality
  const checkIn = async () => {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      if (!location) return;
      
      await sendLocationToServer(location, 'checkin');
      setCheckedIn(true);
      
      // Start tracking after check in
      startTracking();
      
      return true;
    } catch (error) {
      console.error('Check in error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check out functionality
  const checkOut = async () => {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      if (!location) return;
      
      await sendLocationToServer(location, 'checkout');
      setCheckedIn(false);
      
      // Stop tracking after check out
      stopTracking();
      
      return true;
    } catch (error) {
      console.error('Check out error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Start location tracking
  const startTracking = async () => {
    if (isTracking) return;
    
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) return;
    
    // Start background location updates
    const interval = setInterval(async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        
        setLocation(location);
        
        // Send to server
        await sendLocationToServer(location);
        
        // Update history
        setLocationHistory(prev => [
          {
            coords: location.coords,
            timestamp: new Date().toISOString()
          },
          ...prev.slice(0, 19) // Keep last 20 locations
        ]);
      } catch (error) {
        console.error('Error tracking location:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    
    setTrackingInterval(interval);
    setIsTracking(true);
  };

  // Stop location tracking
  const stopTracking = () => {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }
    setIsTracking(false);
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, [trackingInterval]);

  return (
    <LocationContext.Provider
      value={{
        location,
        errorMsg,
        isLoading,
        isTracking,
        checkedIn,
        locationHistory,
        getCurrentLocation,
        checkIn,
        checkOut,
        startTracking,
        stopTracking
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}; 