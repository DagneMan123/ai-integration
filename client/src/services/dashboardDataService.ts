import api from '../utils/api';
import { logger } from '../utils/logger';

/**
 * Centralized service for fetching dashboard data based on user role
 * Handles all database communication for the 3 dashboards
 */

export const dashboardDataService = {
  // CANDIDATE DASHBOARD
  getCandidateDashboard: async () => {
    try {
      const response = await api.get('/dashboard/candidate');
      return response.data;
    } catch (error) {
      logger.error('Error fetching candidate dashboard:', error);
      throw error;
    }
  },

  getCandidateApplications: async () => {
    try {
      const response = await api.get('/applications');
      return response.data;
    } catch (error) {
      logger.error('Error fetching applications:', error);
      throw error;
    }
  },

  getCandidateInterviews: async () => {
    try {
      const response = await api.get('/interviews/candidate');
      return response.data;
    } catch (error) {
      logger.error('Error fetching interviews:', error);
      throw error;
    }
  },

  getCandidateProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      logger.error('Error fetching profile:', error);
      throw error;
    }
  },

  // EMPLOYER DASHBOARD
  getEmployerDashboard: async () => {
    try {
      const response = await api.get('/dashboard/employer');
      return response.data;
    } catch (error) {
      logger.error('Error fetching employer dashboard:', error);
      throw error;
    }
  },

  getEmployerJobs: async () => {
    try {
      const response = await api.get('/jobs/employer');
      return response.data;
    } catch (error) {
      logger.error('Error fetching employer jobs:', error);
      throw error;
    }
  },

  getEmployerApplications: async () => {
    try {
      const response = await api.get('/applications/employer');
      return response.data;
    } catch (error) {
      logger.error('Error fetching employer applications:', error);
      throw error;
    }
  },

  getEmployerInterviews: async () => {
    try {
      const response = await api.get('/interviews/employer');
      return response.data;
    } catch (error) {
      logger.error('Error fetching employer interviews:', error);
      throw error;
    }
  },

  getEmployerAnalytics: async () => {
    try {
      const response = await api.get('/analytics/employer');
      return response.data;
    } catch (error) {
      logger.error('Error fetching employer analytics:', error);
      throw error;
    }
  },

  // ADMIN DASHBOARD
  getAdminDashboard: async () => {
    try {
      const response = await api.get('/dashboard/admin');
      return response.data;
    } catch (error) {
      logger.error('Error fetching admin dashboard:', error);
      throw error;
    }
  },

  getAdminUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      logger.error('Error fetching admin users:', error);
      throw error;
    }
  },

  getAdminCompanies: async () => {
    try {
      const response = await api.get('/admin/companies');
      return response.data;
    } catch (error) {
      logger.error('Error fetching admin companies:', error);
      throw error;
    }
  },

  getAdminJobs: async () => {
    try {
      const response = await api.get('/admin/jobs');
      return response.data;
    } catch (error) {
      logger.error('Error fetching admin jobs:', error);
      throw error;
    }
  },

  getAdminAnalytics: async () => {
    try {
      const response = await api.get('/admin/analytics');
      return response.data;
    } catch (error) {
      logger.error('Error fetching admin analytics:', error);
      throw error;
    }
  },

  getAdminLogs: async () => {
    try {
      const response = await api.get('/admin/logs');
      return response.data;
    } catch (error) {
      logger.error('Error fetching admin logs:', error);
      throw error;
    }
  },

  // CROSS-DASHBOARD COMMUNICATION
  broadcastUpdate: async (dashboard: 'candidate' | 'employer' | 'admin', data: Record<string, unknown>) => {
    try {
      const response = await api.post('/dashboard/broadcast', {
        dashboard,
        data,
        timestamp: new Date()
      });
      return response.data;
    } catch (error) {
      logger.error('Error broadcasting update:', error);
      throw error;
    }
  },

  notifyDashboards: async (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    try {
      const response = await api.post('/dashboard/notify', {
        message,
        type,
        timestamp: new Date()
      });
      return response.data;
    } catch (error) {
      logger.error('Error sending notification:', error);
      throw error;
    }
  }
};
