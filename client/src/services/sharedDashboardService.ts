import api from '../utils/api';

export interface DashboardStats {
  totalUsers: number;
  activeInterviews: number;
  completedApplications: number;
  totalJobs: number;
  pendingApplications: number;
  systemHealth: number;
}

export interface SharedData {
  stats: DashboardStats;
  recentActivities: any[];
  onlineUsers: any[];
  systemNotifications: any[];
}

class SharedDashboardService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getSystemStats(): Promise<DashboardStats> {
    const cacheKey = 'system-stats';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const response = await api.get('/admin/stats');
      const stats = response.data?.data || {
        totalUsers: 0,
        activeInterviews: 0,
        completedApplications: 0,
        totalJobs: 0,
        pendingApplications: 0,
        systemHealth: 100,
      };
      
      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return {
        totalUsers: 0,
        activeInterviews: 0,
        completedApplications: 0,
        totalJobs: 0,
        pendingApplications: 0,
        systemHealth: 0,
      };
    }
  }

  async getCandidateDashboardData(userId: string) {
    try {
      const [applications, interviews, payments] = await Promise.all([
        api.get('/applications/my-applications'),
        api.get('/interviews/my-interviews'),
        api.get('/candidate/payments'),
      ]);

      return {
        applications: applications.data?.data || [],
        interviews: interviews.data?.data || [],
        payments: payments.data?.data || [],
      };
    } catch (error) {
      console.error('Error fetching candidate data:', error);
      return { applications: [], interviews: [], payments: [] };
    }
  }

  async getEmployerDashboardData(userId: string) {
    try {
      const [jobs, applications, interviews] = await Promise.all([
        api.get('/employer/jobs'),
        api.get('/applications'),
        api.get('/interviews'),
      ]);

      return {
        jobs: jobs.data?.data || [],
        applications: applications.data?.data || [],
        interviews: interviews.data?.data || [],
      };
    } catch (error) {
      console.error('Error fetching employer data:', error);
      return { jobs: [], applications: [], interviews: [] };
    }
  }

  async getAdminDashboardData() {
    try {
      const [users, jobs, interviews, applications] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/jobs'),
        api.get('/admin/interviews'),
        api.get('/admin/applications'),
      ]);

      return {
        users: users.data?.data || [],
        jobs: jobs.data?.data || [],
        interviews: interviews.data?.data || [],
        applications: applications.data?.data || [],
      };
    } catch (error) {
      console.error('Error fetching admin data:', error);
      return { users: [], jobs: [], interviews: [], applications: [] };
    }
  }

  async getRecentActivities(limit: number = 10) {
    try {
      const response = await api.get(`/activities?limit=${limit}`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  async getOnlineUsers() {
    try {
      const response = await api.get('/users/online');
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching online users:', error);
      return [];
    }
  }

  async getSystemNotifications() {
    try {
      const response = await api.get('/notifications/system');
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  private isCacheValid(key: string): boolean {
    if (!this.cache.has(key)) return false;
    const { timestamp } = this.cache.get(key)!;
    return Date.now() - timestamp < this.cacheTimeout;
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache() {
    this.cache.clear();
  }
}

export default new SharedDashboardService();
