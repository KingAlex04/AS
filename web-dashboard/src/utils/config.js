// API URLs for backend
const PRODUCTION_API_URL = 'https://hrm-location-tracker-api.onrender.com';
const DEVELOPMENT_API_URL = 'http://localhost:5000';
const BACKUP_API_URL = 'https://hrm-location-tracker-api.herokuapp.com';
const RENDER_API_URL = 'https://hrm-location-tracker-api.onrender.com';
const RAILWAY_API_URL = 'https://hrm-location-tracker-api.up.railway.app';
const VERCEL_API_URL = 'https://hrm-location-tracker-api.vercel.app';

// Determine which API URL to use
// Use local in development, remote in production
const isDevelopment = process.env.NODE_ENV === 'development';
export const API_URL = isDevelopment ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;

// All available API URLs to try in order
export const API_URLS = [
  DEVELOPMENT_API_URL,
  RENDER_API_URL,
  RAILWAY_API_URL,
  VERCEL_API_URL,
  BACKUP_API_URL
].filter((url, index, self) => 
  // Remove duplicates
  self.indexOf(url) === index
);

// App name
export const APP_NAME = 'HRM Location Tracker';

// Default admin credentials - for development/testing only
export const DEFAULT_ADMIN = {
  email: 'laxmisah988@gmail.com',
  password: 'Laxmi@1234#'
};

// API test function
export const testApiEndpoint = async (url, timeout = 5000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${url}`, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    return {
      url,
      online: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    return {
      url,
      online: false,
      error: error.message
    };
  }
}; 