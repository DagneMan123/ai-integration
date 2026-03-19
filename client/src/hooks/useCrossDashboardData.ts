import { useEffect, useState } from 'react';
import crossDashboardService, { DashboardStats } from '../services/crossDashboardService';

export const useCrossDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [statsData, activitiesData, notificationsData] = await Promise.all([
          crossDashboardService.getDashboardStats(),
          crossDashboardService.getRecentActivities(),
          crossDashboardService.getNotifications(),
        ]);

        setStats(statsData);
        setActivities(activitiesData);
        setNotifications(notificationsData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch cross-dashboard data');
        console.error('Error fetching cross-dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to updates
    const handleStatsUpdate = (newStats: DashboardStats) => setStats(newStats);
    const handleActivitiesUpdate = (newActivities: any[]) => setActivities(newActivities);
    const handleNotificationsUpdate = (newNotifications: any[]) => setNotifications(newNotifications);

    crossDashboardService.subscribe('stats-updated', handleStatsUpdate);
    crossDashboardService.subscribe('activities-updated', handleActivitiesUpdate);
    crossDashboardService.subscribe('notifications-updated', handleNotificationsUpdate);

    // Cleanup
    return () => {
      crossDashboardService.unsubscribe('stats-updated', handleStatsUpdate);
      crossDashboardService.unsubscribe('activities-updated', handleActivitiesUpdate);
      crossDashboardService.unsubscribe('notifications-updated', handleNotificationsUpdate);
    };
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      const [statsData, activitiesData, notificationsData] = await Promise.all([
        crossDashboardService.getDashboardStats(),
        crossDashboardService.getRecentActivities(),
        crossDashboardService.getNotifications(),
      ]);

      setStats(statsData);
      setActivities(activitiesData);
      setNotifications(notificationsData);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    activities,
    notifications,
    loading,
    error,
    refresh,
  };
};
