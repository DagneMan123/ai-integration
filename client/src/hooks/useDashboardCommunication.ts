import { useEffect, useState, useCallback } from 'react';
import { dashboardCommunicationService } from '../services/dashboardCommunicationService';

interface Message {
  id: number;
  fromDashboard: string;
  toDashboard?: string;
  eventType: string;
  data: any;
  timestamp: Date;
}

interface Notification {
  id: number;
  dashboard: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: any;
  read: boolean;
  createdAt: Date;
}

interface Stats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalInterviews: number;
  activeInterviews: number;
  pendingApplications: number;
  recentMessages: number;
  timestamp: Date;
}

/**
 * Hook for dashboard communication
 * Manages real-time communication between all 3 dashboards
 */
export const useDashboardCommunication = (dashboard: 'candidate' | 'employer' | 'admin') => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const response = await dashboardCommunicationService.getMessages(dashboard);
      setMessages(response.data || []);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    }
  }, [dashboard]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await dashboardCommunicationService.getNotifications(dashboard, false);
      setNotifications(response.data || []);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    }
  }, [dashboard]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await dashboardCommunicationService.getStats();
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.message);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchMessages(), fetchNotifications(), fetchStats()]);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchMessages();
      fetchNotifications();
      fetchStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchMessages, fetchNotifications, fetchStats]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: number) => {
    try {
      await dashboardCommunicationService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Notify application update (candidate only)
  const notifyApplicationUpdate = useCallback(
    async (applicationId: number, status: string) => {
      if (dashboard !== 'candidate') {
        console.warn('Only candidates can notify application updates');
        return;
      }
      try {
        await dashboardCommunicationService.notifyApplicationUpdate(applicationId, status);
        await fetchMessages();
      } catch (err: any) {
        console.error('Error notifying application update:', err);
        throw err;
      }
    },
    [dashboard, fetchMessages]
  );

  // Notify interview update (employer only)
  const notifyInterviewUpdate = useCallback(
    async (interviewId: number, status: string) => {
      if (dashboard !== 'employer') {
        console.warn('Only employers can notify interview updates');
        return;
      }
      try {
        await dashboardCommunicationService.notifyInterviewUpdate(interviewId, status);
        await fetchMessages();
      } catch (err: any) {
        console.error('Error notifying interview update:', err);
        throw err;
      }
    },
    [dashboard, fetchMessages]
  );

  // Notify system update (admin only)
  const notifySystemUpdate = useCallback(
    async (updateType: string, data: any) => {
      if (dashboard !== 'admin') {
        console.warn('Only admins can notify system updates');
        return;
      }
      try {
        await dashboardCommunicationService.notifySystemUpdate(updateType, data);
        await fetchMessages();
      } catch (err: any) {
        console.error('Error notifying system update:', err);
        throw err;
      }
    },
    [dashboard, fetchMessages]
  );

  // Get unread notification count
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    messages,
    notifications,
    stats,
    loading,
    error,
    unreadCount,
    fetchMessages,
    fetchNotifications,
    fetchStats,
    markNotificationAsRead,
    notifyApplicationUpdate,
    notifyInterviewUpdate,
    notifySystemUpdate
  };
};
