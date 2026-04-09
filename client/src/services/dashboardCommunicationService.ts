import api from '../utils/api';
import { logger } from '../utils/logger';

/**
 * Frontend Dashboard Communication Service
 * Handles all communication between 3 dashboards
 */

export type DashboardRole = 'candidate' | 'employer' | 'admin';

export interface DashboardMessage {
  id: string | number;
  fromDashboard?: string;
  toDashboard?: string;
  eventType?: string;
  data?: Record<string, unknown>;
  timestamp: Date;
  type: 'alert' | 'notification' | 'data-update' | 'request';
  title: string;
  content: string;
  from: DashboardRole;
  read: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalInterviews: number;
  activeInterviews: number;
  pendingApplications: number;
  recentMessages: number;
  timestamp: Date;
  activeJobs: number;
  completedInterviews: number;
  platformRevenue: number;
  lastUpdated: Date;
}

export interface DashboardNotification {
  id: number;
  dashboard: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: any;
  read: boolean;
  createdAt: Date;
}

// Event listeners for real-time updates
const listeners: Map<string, Set<(data: Record<string, unknown>) => void>> = new Map();

export const dashboardCommunicationService = {
  // Subscribe to events
  subscribe: (eventType: string, callback: (data: Record<string, unknown>) => void) => {
    if (!listeners.has(eventType)) {
      listeners.set(eventType, new Set());
    }
    listeners.get(eventType)?.add(callback);

    // Return unsubscribe function
    return () => {
      listeners.get(eventType)?.delete(callback);
    };
  },

  // Emit event to all listeners
  emit: (eventType: string, data: Record<string, unknown>) => {
    listeners.get(eventType)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        logger.error('Error in event listener:', error);
      }
    });
  },

  // Get message history
  getMessages: async (dashboard: string, limit: number = 50) => {
    try {
      const response = await api.get(`/dashboard-communication/messages/${dashboard}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Get real-time stats
  getStats: async () => {
    try {
      const response = await api.get('/dashboard-communication/stats');
      return response.data;
    } catch (error) {
      logger.error('Error fetching stats:', error);
      throw error;
    }
  },

  // Candidate: Notify application update
  notifyApplicationUpdate: async (applicationId: number, status: string) => {
    try {
      const response = await api.post('/dashboard-communication/notify/application-update', {
        applicationId,
        status
      });
      return response.data;
    } catch (error) {
      logger.error('Error notifying application update:', error);
      throw error;
    }
  },

  // Employer: Notify interview update
  notifyInterviewUpdate: async (interviewId: number, status: string) => {
    try {
      const response = await api.post('/dashboard-communication/notify/interview-update', {
        interviewId,
        status
      });
      return response.data;
    } catch (error) {
      logger.error('Error notifying interview update:', error);
      throw error;
    }
  },

  // Admin: Notify system update
  notifySystemUpdate: async (updateType: string, data: Record<string, unknown>) => {
    try {
      const response = await api.post('/dashboard-communication/notify/system-update', {
        updateType,
        data
      });
      return response.data;
    } catch (error) {
      logger.error('Error notifying system update:', error);
      throw error;
    }
  },

  // Get notifications
  getNotifications: async (dashboard: string, unreadOnly: boolean = false) => {
    try {
      const response = await api.get(`/dashboard-communication/notifications/${dashboard}`, {
        params: { unreadOnly }
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId: number) => {
    try {
      const response = await api.put(
        `/dashboard-communication/notifications/${notificationId}/read`
      );
      return response.data;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Get application activity log
  getApplicationActivity: async (applicationId: number) => {
    try {
      const response = await api.get(
        `/dashboard-communication/activity/application/${applicationId}`
      );
      return response.data;
    } catch (error) {
      logger.error('Error fetching application activity:', error);
      throw error;
    }
  },

  // Get interview activity log
  getInterviewActivity: async (interviewId: number) => {
    try {
      const response = await api.get(
        `/dashboard-communication/activity/interview/${interviewId}`
      );
      return response.data;
    } catch (error) {
      logger.error('Error fetching interview activity:', error);
      throw error;
    }
  },

  // Get system updates (admin only)
  getSystemUpdates: async () => {
    try {
      const response = await api.get('/dashboard-communication/system-updates');
      return response.data;
    } catch (error) {
      logger.error('Error fetching system updates:', error);
      throw error;
    }
  }
};
