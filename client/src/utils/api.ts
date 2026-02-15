import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { ApiResponse, User, Job, Application, Interview, Payment, DashboardData } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data;
        useAuthStore.getState().setAuth(
          useAuthStore.getState().user!,
          token,
          newRefreshToken
        );

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const message = error.response?.data?.error || 'An error occurred';
    toast.error(message);

    return Promise.reject(error);
  }
);

export default api;

// API methods
export const authAPI = {
  register: (data: any): Promise<AxiosResponse<ApiResponse<{ user: User; token: string; refreshToken: string }>>> => 
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }): Promise<AxiosResponse<ApiResponse<{ user: User; token: string; refreshToken: string }>>> => 
    api.post('/auth/login', data),
  logout: (): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/auth/logout'),
  forgotPassword: (data: { email: string }): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/auth/forgot-password', data),
  resetPassword: (token: string, data: { password: string }): Promise<AxiosResponse<ApiResponse>> => 
    api.post(`/auth/reset-password/${token}`, data),
  verifyEmail: (token: string): Promise<AxiosResponse<ApiResponse>> => 
    api.post(`/auth/verify-email/${token}`),
  resendVerification: (data: { email: string }): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/auth/resend-verification', data),
};

export const userAPI = {
  getProfile: (): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/users/profile'),
  updateProfile: (data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.put('/users/profile', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }): Promise<AxiosResponse<ApiResponse>> => 
    api.put('/users/password', data),
  uploadAvatar: (formData: FormData): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteAccount: (): Promise<AxiosResponse<ApiResponse>> => 
    api.delete('/users/account'),
};

export const jobAPI = {
  getAllJobs: (params?: any): Promise<AxiosResponse<ApiResponse<Job[]>>> => 
    api.get('/jobs', { params }),
  getJob: (id: string): Promise<AxiosResponse<ApiResponse<Job>>> => 
    api.get(`/jobs/${id}`),
  createJob: (data: any): Promise<AxiosResponse<ApiResponse<Job>>> => 
    api.post('/jobs', data),
  updateJob: (id: string, data: any): Promise<AxiosResponse<ApiResponse<Job>>> => 
    api.put(`/jobs/${id}`, data),
  deleteJob: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.delete(`/jobs/${id}`),
  getEmployerJobs: (): Promise<AxiosResponse<ApiResponse<Job[]>>> => 
    api.get('/jobs/employer/my-jobs'),
  updateJobStatus: (id: string, status: string): Promise<AxiosResponse<ApiResponse>> => 
    api.patch(`/jobs/${id}/status`, { status }),
};

export const applicationAPI = {
  createApplication: (data: any): Promise<AxiosResponse<ApiResponse<Application>>> => 
    api.post('/applications', data),
  getCandidateApplications: (): Promise<AxiosResponse<ApiResponse<Application[]>>> => 
    api.get('/applications/my-applications'),
  getApplication: (id: string): Promise<AxiosResponse<ApiResponse<Application>>> => 
    api.get(`/applications/${id}`),
  withdrawApplication: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.delete(`/applications/${id}`),
  getJobApplications: (jobId: string, params?: any): Promise<AxiosResponse<ApiResponse<Application[]>>> => 
    api.get(`/applications/job/${jobId}`, { params }),
  updateApplicationStatus: (id: string, status: string): Promise<AxiosResponse<ApiResponse>> => 
    api.patch(`/applications/${id}/status`, { status }),
  shortlistCandidate: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.post(`/applications/${id}/shortlist`),
};

export const interviewAPI = {
  startInterview: (data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/interviews/start', data),
  submitAnswer: (id: string, data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.post(`/interviews/${id}/submit-answer`, data),
  completeInterview: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.post(`/interviews/${id}/complete`),
  getCandidateInterviews: (): Promise<AxiosResponse<ApiResponse<Interview[]>>> => 
    api.get('/interviews/my-interviews'),
  getInterviewReport: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.get(`/interviews/${id}/report`),
  getJobInterviews: (jobId: string): Promise<AxiosResponse<ApiResponse<Interview[]>>> => 
    api.get(`/interviews/job/${jobId}/interviews`),
  evaluateInterview: (id: string, data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.post(`/interviews/${id}/evaluate`, data),
};

export const paymentAPI = {
  initializePayment: (data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/payments/initialize', data),
  verifyPayment: (txRef: string): Promise<AxiosResponse<ApiResponse>> => 
    api.get(`/payments/verify/${txRef}`),
  getPaymentHistory: (): Promise<AxiosResponse<ApiResponse<Payment[]>>> => 
    api.get('/payments/history'),
  getSubscription: (): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/payments/subscription'),
  cancelSubscription: (): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/payments/subscription/cancel'),
};

export const analyticsAPI = {
  getCandidateDashboard: (): Promise<AxiosResponse<ApiResponse<DashboardData>>> => 
    api.get('/analytics/candidate/dashboard'),
  getCandidatePerformance: (): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/analytics/candidate/performance'),
  getEmployerDashboard: (): Promise<AxiosResponse<ApiResponse<DashboardData>>> => 
    api.get('/analytics/employer/dashboard'),
  getJobAnalytics: (jobId: string): Promise<AxiosResponse<ApiResponse>> => 
    api.get(`/analytics/employer/job/${jobId}`),
  getAdminDashboard: (): Promise<AxiosResponse<ApiResponse<DashboardData>>> => 
    api.get('/analytics/admin/dashboard'),
  getRevenueAnalytics: (params?: any): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/analytics/admin/revenue', { params }),
  getUserAnalytics: (): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/analytics/admin/users'),
};

export const adminAPI = {
  getAllUsers: (params?: any): Promise<AxiosResponse<ApiResponse<User[]>>> => 
    api.get('/admin/users', { params }),
  getUser: (id: string): Promise<AxiosResponse<ApiResponse<User>>> => 
    api.get(`/admin/users/${id}`),
  updateUserStatus: (id: string, data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.patch(`/admin/users/${id}/status`, data),
  updateUserRole: (id: string, data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.patch(`/admin/users/${id}/role`, data),
  deleteUser: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.delete(`/admin/users/${id}`),
  getPendingCompanies: (): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/admin/companies/pending'),
  verifyCompany: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.patch(`/admin/companies/${id}/verify`),
  rejectCompany: (id: string, data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.patch(`/admin/companies/${id}/reject`, data),
  getPendingJobs: (): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/admin/jobs/pending'),
  approveJob: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.patch(`/admin/jobs/${id}/approve`),
  rejectJob: (id: string, data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.patch(`/admin/jobs/${id}/reject`, data),
  getActivityLogs: (params?: any): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/admin/logs', { params }),
  getSuspiciousActivity: (): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/admin/logs/suspicious'),
  getAllPayments: (params?: any): Promise<AxiosResponse<ApiResponse<Payment[]>>> => 
    api.get('/payments/all', { params }),
  refundPayment: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.post(`/payments/${id}/refund`),
};

export const companyAPI = {
  getAllCompanies: (params?: any): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/companies', { params }),
  getCompany: (id: string): Promise<AxiosResponse<ApiResponse>> => 
    api.get(`/companies/${id}`),
  getMyCompany: (): Promise<AxiosResponse<ApiResponse>> => 
    api.get('/companies/my/profile'),
  updateCompany: (data: any): Promise<AxiosResponse<ApiResponse>> => 
    api.put('/companies/my/profile', data),
  uploadLogo: (formData: FormData): Promise<AxiosResponse<ApiResponse>> => 
    api.post('/companies/my/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};
