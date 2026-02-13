import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
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
          useAuthStore.getState().user,
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
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  verifyEmail: (token) => api.post(`/auth/verify-email/${token}`),
  resendVerification: (data) => api.post('/auth/resend-verification', data),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updatePassword: (data) => api.put('/users/password', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAccount: () => api.delete('/users/account'),
};

export const jobAPI = {
  getAllJobs: (params) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getEmployerJobs: () => api.get('/jobs/employer/my-jobs'),
  updateJobStatus: (id, status) => api.patch(`/jobs/${id}/status`, { status }),
};

export const applicationAPI = {
  createApplication: (data) => api.post('/applications', data),
  getCandidateApplications: () => api.get('/applications/my-applications'),
  getApplication: (id) => api.get(`/applications/${id}`),
  withdrawApplication: (id) => api.delete(`/applications/${id}`),
  getJobApplications: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  updateApplicationStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
  shortlistCandidate: (id) => api.post(`/applications/${id}/shortlist`),
};

export const interviewAPI = {
  startInterview: (data) => api.post('/interviews/start', data),
  submitAnswer: (id, data) => api.post(`/interviews/${id}/submit-answer`, data),
  completeInterview: (id) => api.post(`/interviews/${id}/complete`),
  getCandidateInterviews: () => api.get('/interviews/my-interviews'),
  getInterviewReport: (id) => api.get(`/interviews/${id}/report`),
  getJobInterviews: (jobId) => api.get(`/interviews/job/${jobId}/interviews`),
  evaluateInterview: (id, data) => api.post(`/interviews/${id}/evaluate`, data),
};

export const paymentAPI = {
  initializePayment: (data) => api.post('/payments/initialize', data),
  verifyPayment: (txRef) => api.get(`/payments/verify/${txRef}`),
  getPaymentHistory: () => api.get('/payments/history'),
  getSubscription: () => api.get('/payments/subscription'),
  cancelSubscription: () => api.post('/payments/subscription/cancel'),
};

export const analyticsAPI = {
  getCandidateDashboard: () => api.get('/analytics/candidate/dashboard'),
  getCandidatePerformance: () => api.get('/analytics/candidate/performance'),
  getEmployerDashboard: () => api.get('/analytics/employer/dashboard'),
  getJobAnalytics: (jobId) => api.get(`/analytics/employer/job/${jobId}`),
  getAdminDashboard: () => api.get('/analytics/admin/dashboard'),
  getRevenueAnalytics: (params) => api.get('/analytics/admin/revenue', { params }),
  getUserAnalytics: () => api.get('/analytics/admin/users'),
};

export const adminAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, data) => api.patch(`/admin/users/${id}/status`, data),
  updateUserRole: (id, data) => api.patch(`/admin/users/${id}/role`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPendingCompanies: () => api.get('/admin/companies/pending'),
  verifyCompany: (id) => api.patch(`/admin/companies/${id}/verify`),
  rejectCompany: (id, data) => api.patch(`/admin/companies/${id}/reject`, data),
  getPendingJobs: () => api.get('/admin/jobs/pending'),
  approveJob: (id) => api.patch(`/admin/jobs/${id}/approve`),
  rejectJob: (id, data) => api.patch(`/admin/jobs/${id}/reject`, data),
  getActivityLogs: (params) => api.get('/admin/logs', { params }),
  getSuspiciousActivity: () => api.get('/admin/logs/suspicious'),
  getAllPayments: (params) => api.get('/payments/all', { params }),
  refundPayment: (id) => api.post(`/payments/${id}/refund`),
};

export const companyAPI = {
  getAllCompanies: (params) => api.get('/companies', { params }),
  getCompany: (id) => api.get(`/companies/${id}`),
  getMyCompany: () => api.get('/companies/my/profile'),
  updateCompany: (data) => api.put('/companies/my/profile', data),
  uploadLogo: (formData) => api.post('/companies/my/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
