import axios from 'axios';
import { isTokenExpired } from './jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Function to get token from session (for client-side usage)
const getTokenFromSession = () => {
  if (typeof window !== 'undefined') {
    // Try to get token from localStorage first (fallback)
    const localToken = localStorage.getItem('token');
    if (localToken) {
      return localToken;
    }
    
    // Try to get token from sessionStorage (if stored there)
    const sessionToken = sessionStorage.getItem('backendToken');
    if (sessionToken) {
      return sessionToken;
    }
  }
  return null;
};

// Create a function to create an API instance with a specific token
export const createApiWithToken = (token: string) => {
  const apiInstance = axios.create({
    baseURL: API_BASE_URL,
  });

  // Add request interceptor to include auth token and check expiration
  apiInstance.interceptors.request.use((config) => {
    if (token) {
      // Check if token is expired before making the request
      const tokenExpired = isTokenExpired(token);
      if (tokenExpired === true) {
        console.warn('Token is expired');
        return Promise.reject(new Error('Token expired'));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Add response interceptor to handle token expiration errors
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token is invalid or expired
        console.warn('Received 401 error, token may be expired');
      }
      return Promise.reject(error);
    }
  );

  return apiInstance;
};

// Add request interceptor to include auth token and check expiration
api.interceptors.request.use((config) => {
  const token = getTokenFromSession();
  if (token) {
    // Check if token is expired before making the request
    const tokenExpired = isTokenExpired(token);
    if (tokenExpired === true) {
      console.warn('Token is expired, removing from storage');
      localStorage.removeItem('token');
      sessionStorage.removeItem('backendToken');
      // You might want to redirect to login here or trigger a logout
      return Promise.reject(new Error('Token expired'));
    }
    
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      console.warn('Received 401 error, token may be expired');
      localStorage.removeItem('token');
      sessionStorage.removeItem('backendToken');
      // You might want to redirect to login here or trigger a logout
    }
    return Promise.reject(error);
  }
);

export { api, API_BASE_URL, FRONTEND_URL };