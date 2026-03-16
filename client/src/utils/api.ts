import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { 
  ApiResponse, 
  AuthResponse,
  User, 
  Job, 
  Application, 
  Interview, 
  Payment, 
  DashboardData,
  Company
} from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * 1. Axios Instance Configuration
 */
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Remove Content-Type header for FormData requests
api.defaults.headers.common['Content-Type'] = 'application/json';

// ለRefresh Token ጥያቄዎች የሚሆን Queue (Thread-safety)
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

/**
 * 2. Request Interceptor: መለያ (Token) መላኪያ
 */
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData - let browser handle it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 3. Response Interceptor: የቶከን እድሳትና ስህተት አያያዝ
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized - Token Expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error("No refresh token available");

        const res = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        const { token, refreshToken: newRefreshToken } = res.data.data;

        useAuthStore.getState().setAuth(useAuthStore.getState().user!, token, newRefreshToken);
        
        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ስህተቶችን ለተጠቃሚው ማሳያ (Toast)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');
    if (!isAuthEndpoint && error.response?.status !== 401) {
      const message = error.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

/**
 * 4. Helper API Wrapper (ለተደጋጋሚ ኮድ መቀነሻ)
 */
const request = {
  get: <T>(url: string, config?: AxiosRequestConfig) => api.get<ApiResponse<T>>(url, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => api.post<ApiResponse<T>>(url, data, config),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => api.put<ApiResponse<T>>(url, data, config),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => api.patch<ApiResponse<T>>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) => api.delete<ApiResponse<T>>(url, config),
};

/**
 * 5. Domain Specific Services
 */

export const authAPI = {
  login: (data: object) => api.post<AuthResponse>('/auth/login', data),
  register: (data: object) => api.post<AuthResponse>('/auth/register', data),
  forgotPassword: (emailOrData: string | object) => {
    const data = typeof emailOrData === 'string' ? { email: emailOrData } : emailOrData;
    return request.post('/auth/forgot-password', data);
  },
  resetPassword: (token: string, data: object) => request.post(`/auth/reset-password/${token}`, data),
  verifyEmail: (token: string) => request.post(`/auth/verify-email/${token}`),
};

export const jobAPI = {
  getAll: (params: object) => request.get<Job[]>('/jobs', { params }),
  getAllJobs: (params: object) => request.get<Job[]>('/jobs', { params }), // Alias
  getOne: (id: string) => request.get<Job>(`/jobs/${id}`),
  getJob: (id: string) => request.get<Job>(`/jobs/${id}`), // Alias
  create: (data: object) => request.post<Job>('/jobs', data),
  createJob: (data: object) => request.post<Job>('/jobs', data), // Alias
  update: (id: string, data: object) => request.put<Job>(`/jobs/${id}`, data),
  updateJob: (id: string, data: object) => request.put<Job>(`/jobs/${id}`, data), // Alias
  updateJobStatus: (id: string, status: string) => request.patch(`/jobs/${id}/status`, { status }), // Alias
  delete: (id: string) => request.delete(`/jobs/${id}`),
  deleteJob: (id: string) => request.delete(`/jobs/${id}`), // Alias
  getEmployerJobs: () => request.get<Job[]>('/jobs/employer/my-jobs'),
};

export const interviewAPI = {
  start: (data: object) => request.post<Interview>('/interviews/start', data),
  submitAnswer: (id: string, data: object) => request.post(`/interviews/${id}/submit-answer`, data),
  complete: (id: string) => request.post(`/interviews/${id}/complete`),
  completeInterview: (id: string) => request.post(`/interviews/${id}/complete`), // Alias
  getReport: (id: string) => request.get(`/interviews/${id}/report`),
  getInterviewReport: (id: string) => request.get(`/interviews/${id}/report`), // Alias
  getCandidateInterviews: () => request.get<Interview[]>('/interviews/candidate/my-interviews'),
  logViolation: (id: string, data: object) => request.post(`/interviews/${id}/anti-cheat-event`, data),
  recordAntiCheatEvent: (id: string, data: object) => request.post(`/interviews/${id}/anti-cheat-event`, data), // Alias
  recordIdentitySnapshot: (id: string, data: object) => request.post(`/interviews/${id}/identity-snapshot`, data),
};

export const paymentAPI = {
  initialize: (data: { amount: number; type: string; description?: string }) => request.post<any>('/payments/initialize', data),
  initializePayment: (data: { amount: number; type: string; description?: string }) => request.post<any>('/payments/initialize', data), // Alias
  verify: (txRef: string) => request.get<any>(`/payments/verify/${txRef}`),
  verifyPayment: (txRef: string) => request.get<any>(`/payments/verify/${txRef}`), // Alias
  getHistory: () => request.get<Payment[]>('/payments/history'),
  getPaymentHistory: () => request.get<Payment[]>('/payments/history'), // Alias
  getSubscription: () => request.get<any>('/payments/subscription'), // Alias
};

export const companyAPI = {
  getProfile: () => request.get<Company>('/companies/profile'),
  getMyCompany: () => request.get<Company>('/companies/profile'), // Alias
  updateProfile: (data: object) => request.put<Company>('/companies/profile', data),
  updateCompany: (data: object) => request.put<Company>('/companies/profile', data), // Alias
  uploadLogo: (file: FormData) => request.post<Company>('/companies/upload-logo', file),
  getAll: (params?: object) => request.get<Company[]>('/companies', { params: params || {} }),
};

export const adminAPI = {
  getUsers: (params?: object) => request.get<User[]>('/admin/users', { params: params || {} }),
  getAllUsers: (params?: object) => request.get<User[]>('/admin/users', { params: params || {} }), // Alias
  verifyCompany: (id: string) => request.patch(`/admin/companies/${id}/verify`),
  approveJob: (id: string) => request.patch(`/admin/jobs/${id}/approve`),
  getLogs: () => request.get('/admin/logs'),
};

export const userAPI = {
  getProfile: () => request.get<User>('/users/profile'),
  updateProfile: (data: object) => request.put<User>('/users/profile', data),
  changePassword: (data: object) => request.post('/users/change-password', data),
  uploadAvatar: (file: FormData) => request.post<User>('/users/avatar', file),
};

export const analyticsAPI = {
  getEmployerDashboard: () => request.get<DashboardData>('/analytics/employer/dashboard'),
  getCandidateDashboard: () => request.get<DashboardData>('/analytics/candidate/dashboard'),
  getAdminDashboard: () => request.get<DashboardData>('/analytics/admin/dashboard'),
};

export const applicationAPI = {
  getAll: (params: object) => request.get<Application[]>('/applications', { params }),
  getOne: (id: string) => request.get<Application>(`/applications/${id}`),
  create: (data: object) => request.post<Application>('/applications', data),
  createApplication: (data: object) => request.post<Application>('/applications', data), // Alias
  update: (id: string, data: object) => request.put<Application>(`/applications/${id}`, data),
  updateStatus: (id: string, status: string) => request.patch(`/applications/${id}/status`, { status }), // Alias
  delete: (id: string) => request.delete(`/applications/${id}`),
  getCandidateApplications: () => request.get<Application[]>('/applications/candidate/my-applications'),
  getJobApplications: (jobId: string) => request.get<Application[]>(`/applications/job/${jobId}`), // Alias
};

export default api;