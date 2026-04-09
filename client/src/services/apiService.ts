/**
 * Professional API Service
 * Centralized API communication with error handling and logging
 */

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
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
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

        // Handle 401 - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.api(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = useAuthStore.getState().refreshToken;
            if (!refreshToken) throw new Error('No refresh token');

            const response = await axios.post(`${API_URL}/auth/refresh-token`, {
              refreshToken,
            });

            const { token, refreshToken: newRefreshToken } = response.data.data;
            useAuthStore.getState().setAuth(useAuthStore.getState().user!, token, newRefreshToken);

            this.processQueue(null, token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError instanceof Error ? refreshError : new Error(String(refreshError)), null);
            useAuthStore.getState().logout();
            window.location.href = '/login?expired=true';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
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

    switch (status) {
      case 400:
        toast.error(message || 'Invalid request');
        break;
      case 401:
        // Handled by interceptor
        break;
      case 403:
        toast.error('Access denied');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 409:
        toast.error(message || 'Resource already exists');
        break;
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        if (message) toast.error(message);
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      logger.error('API Error:', {
        status,
        message,
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
  async post<T>(url: string, data?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
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
