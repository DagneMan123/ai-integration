import { useEffect, useState, useCallback } from 'react';
import { dashboardCommunicationService, DashboardMessage, DashboardStats, DashboardRole } from '../services/dashboardCommunicationService';

export const useDashboardCommunication = (role: DashboardRole) => {
  const [messages, setMessages] = useState<DashboardMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<DashboardStats>(dashboardCommunicationService.getStats());

  // Load initial messages
  useEffect(() => {
    const initialMessages = dashboardCommunicationService.getMessages(role);
    setMessages(initialMessages);
    setUnreadCount(dashboardCommunicationService.getUnreadCount(role));
  }, [role]);

  // Subscribe to message events
  useEffect(() => {
    const unsubscribeMessage = dashboardCommunicationService.subscribe('message-received', (message: DashboardMessage) => {
      if (message.to === role || message.to === 'all') {
        setMessages(prev => [...prev, message]);
        setUnreadCount(prev => prev + 1);
      }
    });

    const unsubscribeRead = dashboardCommunicationService.subscribe('message-read', () => {
      setUnreadCount(dashboardCommunicationService.getUnreadCount(role));
    });

    const unsubscribeStats = dashboardCommunicationService.subscribe('stats-updated', (newStats: DashboardStats) => {
      setStats(newStats);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeRead();
      unsubscribeStats();
    };
  }, [role]);

  // Send message
  const sendMessage = useCallback(
    (to: DashboardRole | 'all', type: DashboardMessage['type'], title: string, content: string, data?: any) => {
      return dashboardCommunicationService.sendMessage(role, to, type, title, content, data);
    },
    [role]
  );

  // Mark message as read
  const markAsRead = useCallback((messageId: string) => {
    dashboardCommunicationService.markAsRead(messageId);
  }, []);

  // Request data from another dashboard
  const requestData = useCallback(
    (to: DashboardRole, dataType: string) => {
      return dashboardCommunicationService.requestData(role, to, dataType);
    },
    [role]
  );

  // Broadcast alert
  const broadcastAlert = useCallback(
    (title: string, content: string, severity: 'info' | 'warning' | 'error' = 'info') => {
      dashboardCommunicationService.broadcastAlert(role, title, content, severity);
    },
    [role]
  );

  // Update stats
  const updateStats = useCallback((updates: Partial<DashboardStats>) => {
    dashboardCommunicationService.updateStats(updates);
  }, []);

  return {
    messages,
    unreadCount,
    stats,
    sendMessage,
    markAsRead,
    requestData,
    broadcastAlert,
    updateStats
  };
};
