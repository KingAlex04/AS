// API URLs for backend
const PRODUCTION_API_URL = 'https://hrm-location-tracker-api.onrender.com';
const DEVELOPMENT_API_URL = 'http://localhost:5000';
const BACKUP_API_URL = 'https://hrm-location-tracker-api.herokuapp.com';

// Determine which API URL to use
// Use local in development, remote in production
const isDevelopment = process.env.NODE_ENV === 'development';
export const API_URL = isDevelopment ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;

// All available API URLs to try in order
export const API_URLS = [API_URL, BACKUP_API_URL];

// App name
export const APP_NAME = 'HRM Location Tracker';

// Default admin credentials - for development/testing only
export const DEFAULT_ADMIN = {
  email: 'laxmisah988@gmail.com',
  password: 'Laxmi@1234#'
}; 