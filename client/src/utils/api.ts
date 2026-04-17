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
  timeout: 60000, // Increased from 30s to 60s to handle Chapa verification
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

    // 429 Too Many Requests - Rate Limit with Exponential Backoff
    if (error.response?.status === 429 && !originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    if (error.response?.status === 429 && originalRequest._retryCount < 5) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      const delayMs = Math.pow(2, originalRequest._retryCount) * 1000; // 2s, 4s, 8s, 16s, 32s
      
      console.warn(`Rate limited. Retrying in ${delayMs}ms (attempt ${originalRequest._retryCount}/5)`);
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return api(originalRequest);
    }

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

    // ስህተቶችን ለተጠቃሚው ማሳያ (Toast) - but not for rate limits (already handled)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');
    const isRateLimitError = error.response?.status === 429;
    if (!isAuthEndpoint && error.response?.status !== 401 && !isRateLimitError) {
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
  getOne: (id: string) => request.get<Job>(`/jobs/${id}`),
  create: (data: object) => request.post<Job>('/jobs', data),
  update: (id: string, data: object) => request.put<Job>(`/jobs/${id}`, data),
  updateStatus: (id: string, status: string) => request.patch(`/jobs/${id}/status`, { status }),
  delete: (id: string) => request.delete(`/jobs/${id}`),
  getEmployerJobs: () => request.get<Job[]>('/jobs/employer/my-jobs'),
};

export const interviewAPI = {
  start: (data: object) => request.post<Interview>('/interviews/start', data),
  submitAnswer: (data: object) => request.post('/interviews/submit-answer', data),
  complete: (id: string) => request.post(`/interviews/${id}/complete`),
  getReport: (id: string) => request.get(`/interviews/${id}/report`),
  getCandidateInterviews: () => request.get<Interview[]>('/interviews/candidate/my-interviews'),
  recordAntiCheatEvent: (id: string, data: object) => request.post(`/interviews/${id}/anti-cheat-event`, data),
  recordIdentitySnapshot: (id: string, data: object) => request.post(`/interviews/${id}/identity-snapshot`, data),
  submitProctorReport: (data: object) => request.post('/interviews/proctor-report', data),
};

export const paymentAPI = {
  initialize: (data: { amount: number; type: string; description?: string; creditAmount?: number; bundleId?: string }) => request.post<any>('/payments/initialize', data),
  verify: (txRef: string) => request.get<any>(`/payments/verify/${txRef}`),
  getHistory: () => request.get<Payment[]>('/payments/history'),
  getSubscription: () => request.get<any>('/subscription'),
};

export const companyAPI = {
  getProfile: () => request.get<Company>('/companies/profile'),
  updateProfile: (data: object) => request.put<Company>('/companies/profile', data),
  uploadLogo: (file: FormData) => request.post<Company>('/companies/upload-logo', file),
  getAll: (params?: object) => request.get<Company[]>('/companies', { params: params || {} }),
};

export const adminAPI = {
  getUsers: (params?: object) => request.get<User[]>('/admin/users', { params: params || {} }),
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
  update: (id: string, data: object) => request.put<Application>(`/applications/${id}`, data),
  updateStatus: (id: string, status: string) => request.patch(`/applications/${id}/status`, { status }),
  delete: (id: string) => request.delete(`/applications/${id}`),
  getCandidateApplications: () => request.get<Application[]>('/applications/candidate/my-applications'),
  getJobApplications: (jobId: string) => request.get<Application[]>(`/applications/job/${jobId}`),
};

export const messageAPI = {
  getAll: () => request.get('/messages'),
  getOne: (id: string) => request.get(`/messages/${id}`),
  send: (data: object) => request.post('/messages', data),
  markAsRead: (id: string) => request.patch(`/messages/${id}/read`),
  toggleArchive: (id: string) => request.patch(`/messages/${id}/archive`),
  delete: (id: string) => request.delete(`/messages/${id}`),
};

export const practiceAPI = {
  getSessions: () => request.get('/practice/sessions'),
  createSession: (data: object) => request.post('/practice/sessions', data),
  getSessionDetails: (sessionId: string) => request.get(`/practice/sessions/${sessionId}`),
  submitAnswer: (sessionId: string, data: object) => request.post(`/practice/sessions/${sessionId}/answer`, data),
  endSession: (sessionId: string) => request.post(`/practice/sessions/${sessionId}/end`),
  getStats: () => request.get('/practice/stats'),
};

export default api;