
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { logger } from '../utils/logger';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface ApiErrorResponse {
  message: string;
  statusCode: number;
  errors?: Array<{ field: string; message: string }>;
}

interface ApiSuccessResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
  timestamp: string;
}

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - FETCH TOKEN AT REQUEST TIME from localStorage
    this.api.interceptors.request.use(
      (config) => {
        // CRITICAL: Fetch token directly from localStorage at request time
        // This ensures we always have the latest token after login
        const token = localStorage.getItem('token');
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('[API Service] Token injected at request time:', token.substring(0, 20) + '...');
        } else {
          console.log('[API Service] No token found in localStorage');
        }

        // Handle FormData
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as any;

        // STEP 4: AXIOS INTERCEPTOR - 401 error only clears token, no page refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.error('[API Service] 401 Unauthorized - Clearing token only (no page refresh)');
          
          // CRITICAL: Only remove token from localStorage - NO page refresh
          console.log('[API Service] Removing token from localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          // Clear auth store
          console.log('[API Service] Clearing auth store');
          useAuthStore.getState().logout();
          
          // Reset refresh flag
          this.isRefreshing = false;
          this.failedQueue = [];
          
          // CRITICAL: Do NOT redirect - let PrivateRoute handle it
          // This prevents page refresh and redirect loops
          console.log('[API Service] Token cleared - PrivateRoute will render Login component');
          
          return Promise.reject(error);
        }

        // Handle other errors
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: Error | null, token: string | null) {
    this.failedQueue.forEach((prom) => {
      if (error) prom.reject(error);
      else prom.resolve(token!);
    });
    this.failedQueue = [];
  }

  private handleError(error: AxiosError<ApiErrorResponse>) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const url = error.config?.url || '';

    // Don't show error toast for certain endpoints that have fallback data
    const silentErrorEndpoints = ['/help-center/categories', '/help-center/articles', '/users/documents'];
    const shouldSilence = silentErrorEndpoints.some(endpoint => url.includes(endpoint));

    switch (status) {
      case 400:
        if (!shouldSilence) toast.error(message || 'Invalid request');
        break;
      case 401:
        // Handled by interceptor
        break;
      case 403:
        if (!shouldSilence) toast.error('Access denied');
        break;
      case 404:
        if (!shouldSilence) toast.error('Resource not found');
        break;
      case 409:
        if (!shouldSilence) toast.error(message || 'Resource already exists');
        break;
      case 429:
        // Don't show toast for 429 on help center - it has fallback data
        if (!shouldSilence) toast.error('Too many requests. Please try again later.');
        break;
      case 500:
      case 503:
        if (!shouldSilence) toast.error('Server error. Please try again later.');
        break;
      default:
        if (message && !shouldSilence) toast.error(message);
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      logger.error('API Error:', {
        status,
        message,
        url,
        data: error.response?.data,
      });
    }
  }

  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<ApiSuccessResponse<T>>(url, config);
    return response.data.data;
  }

  // POST request
  async post<T>(url: string, data?: Record<string, unknown> | FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<ApiSuccessResponse<T>>(url, data, config);
    return response.data.data;
  }

  // PUT request
  async put<T>(url: string, data?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<ApiSuccessResponse<T>>(url, data, config);
    return response.data.data;
  }

  // PATCH request
  async patch<T>(url: string, data?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<ApiSuccessResponse<T>>(url, data, config);
    return response.data.data;
  }

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<ApiSuccessResponse<T>>(url, config);
    return response.data.data;
  }
}

export const apiService = new ApiService();
export default apiService;
