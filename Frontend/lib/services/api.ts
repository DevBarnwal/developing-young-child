// API service base configuration
import axios from 'axios';
import { ApiResponse } from '../types/models';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from cookie for server-side requests
    const cookies = typeof window !== 'undefined' ? document.cookie : '';
    const tokenCookie = cookies.split(';').find(cookie => cookie.trim().startsWith('token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;
    
    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Clear cookie and redirect to login on auth error
      if (typeof window !== 'undefined') {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Generic request function with error handling
async function request<T>(method: string, url: string, data?: any): Promise<ApiResponse<T>> {
  try {
    const response = await api.request<ApiResponse<T>>({
      method,
      url,
      data,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data as ApiResponse<T>;
    }
    
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
}

// Export api methods
export const apiService = {
  get: <T>(url: string) => request<T>('GET', url),
  post: <T>(url: string, data: any) => request<T>('POST', url, data),
  put: <T>(url: string, data: any) => request<T>('PUT', url, data),
  delete: <T>(url: string) => request<T>('DELETE', url),
};

export default api;
