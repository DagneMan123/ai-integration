import api from '../utils/api';

export interface DashboardStats {
  totalUsers: number;
  activeInterviews: number;
  pendingApplications: number;
  completedInterviews: number;
  totalJobs: number;
  totalCompanies: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export interface SharedData {
  stats: DashboardStats;
  recentActivities: any[];
  notifications: any[];
  systemMetrics: any;
}

class CrossDashboardService {
  private listeners: Map<string, Function[]> = new Map();

  // Subscribe to data changes
  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  // Unsubscribe from data changes
  unsubscribe(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit data changes to all subscribers
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Fetch dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/dashboard/stats');
      const stats = response.data?.data || {};
      this.emit('stats-updated', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Fetch recent activities across all dashboards
  async getRecentActivities(limit: number = 10): Promise<any[]> {
    try {
      const response = await api.get(`/dashboard/activities?limit=${limit}`);
      const activities = response.data?.data || [];
      this.emit('activities-updated', activities);
      return activities;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  // Fetch system notifications
  async getNotifications(): Promise<any[]> {
    try {
      const response = await api.get('/dashboard/notifications');
      const notifications = response.data?.data || [];
      this.emit('notifications-updated', notifications);
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Get candidate-specific shared data
  async getCandidateSharedData() {
    try {
      const response = await api.get('/dashboard/candidate/shared');
      return response.data?.data || {};
    } catch (error) {
      console.error('Error fetching candidate shared data:', error);
      throw error;
    }
  }

  // Get employer-specific shared data
  async getEmployerSharedData() {
    try {
      const response = await api.get('/dashboard/employer/shared');
      return response.data?.data || {};
    } catch (error) {
      console.error('Error fetching employer shared data:', error);
      throw error;
    }
  }

  // Get admin-specific shared data
  async getAdminSharedData() {
    try {
      const response = await api.get('/dashboard/admin/shared');
      return response.data?.data || {};
    } catch (error) {
      console.error('Error fetching admin shared data:', error);
      throw error;
    }
  }

  // Broadcast event to all dashboards
  async broadcastEvent(eventType: string, data: any) {
    try {
      await api.post('/dashboard/broadcast', { eventType, data });
      this.emit(`broadcast-${eventType}`, data);
    } catch (error) {
      console.error('Error broadcasting event:', error);
      throw error;
    }
  }

  // Poll for updates (can be replaced with WebSocket later)
  startPolling(interval: number = 30000) {
    setInterval(async () => {
      try {
        await this.getDashboardStats();
        await this.getRecentActivities();
        await this.getNotifications();
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, interval);
  }
}

const crossDashboardServiceInstance = new CrossDashboardService();
export default crossDashboardServiceInstance;
