// Cross-Dashboard Communication Service
// Enables real-time data sharing between Admin, Employer, and Candidate dashboards

type DashboardRole = 'admin' | 'employer' | 'candidate';

interface DashboardMessage {
  id: string;
  from: DashboardRole;
  to: DashboardRole | 'all';
  type: 'notification' | 'data-update' | 'alert' | 'request';
  title: string;
  content: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

interface DashboardStats {
  totalUsers: number;
  activeJobs: number;
  pendingApplications: number;
  completedInterviews: number;
  platformRevenue: string;
  lastUpdated: Date;
}

class DashboardCommunicationService {
  private messages: DashboardMessage[] = [];
  private stats: DashboardStats = {
    totalUsers: 2847,
    activeJobs: 156,
    pendingApplications: 342,
    completedInterviews: 1234,
    platformRevenue: '$45,230',
    lastUpdated: new Date()
  };
  private listeners: Map<string, Function[]> = new Map();

  // Send message between dashboards
  sendMessage(
    from: DashboardRole,
    to: DashboardRole | 'all',
    type: DashboardMessage['type'],
    title: string,
    content: string,
    data?: any
  ): DashboardMessage {
    const message: DashboardMessage = {
      id: `msg-${Date.now()}`,
      from,
      to,
      type,
      title,
      content,
      data,
      timestamp: new Date(),
      read: false
    };

    this.messages.push(message);
    this.notifyListeners('message-received', message);
    return message;
  }

  // Get messages for a specific dashboard
  getMessages(role: DashboardRole, unreadOnly: boolean = false): DashboardMessage[] {
    return this.messages.filter(msg => {
      const isForRole = msg.to === role || msg.to === 'all';
      if (unreadOnly) {
        return isForRole && !msg.read;
      }
      return isForRole;
    });
  }

  // Mark message as read
  markAsRead(messageId: string): void {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      message.read = true;
      this.notifyListeners('message-read', message);
    }
  }

  // Update shared statistics
  updateStats(updates: Partial<DashboardStats>): void {
    this.stats = {
      ...this.stats,
      ...updates,
      lastUpdated: new Date()
    };
    this.notifyListeners('stats-updated', this.stats);
  }

  // Get current statistics
  getStats(): DashboardStats {
    return { ...this.stats };
  }

  // Broadcast alert to all dashboards
  broadcastAlert(from: DashboardRole, title: string, content: string, severity: 'info' | 'warning' | 'error'): void {
    const message = this.sendMessage(from, 'all', 'alert', title, content, { severity });
    this.notifyListeners('alert-broadcast', message);
  }

  // Request data from another dashboard
  requestData(from: DashboardRole, to: DashboardRole, dataType: string): Promise<any> {
    return new Promise((resolve) => {
      const requestId = `req-${Date.now()}`;
      const message = this.sendMessage(from, to, 'request', `Data Request: ${dataType}`, `Requesting ${dataType}`, { requestId, dataType });
      
      // Simulate response after 500ms
      setTimeout(() => {
        const responseData = this.getDataByType(dataType);
        resolve(responseData);
      }, 500);
    });
  }

  // Get data by type
  private getDataByType(dataType: string): any {
    switch (dataType) {
      case 'job-stats':
        return { activeJobs: this.stats.activeJobs, totalJobs: 245 };
      case 'candidate-stats':
        return { totalCandidates: this.stats.totalUsers, activeApplications: this.stats.pendingApplications };
      case 'interview-stats':
        return { completedInterviews: this.stats.completedInterviews, scheduledInterviews: 89 };
      case 'revenue-stats':
        return { platformRevenue: this.stats.platformRevenue, monthlyGrowth: '+18.7%' };
      default:
        return this.stats;
    }
  }

  // Subscribe to events
  subscribe(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Notify all listeners
  private notifyListeners(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Get unread message count
  getUnreadCount(role: DashboardRole): number {
    return this.messages.filter(msg => (msg.to === role || msg.to === 'all') && !msg.read).length;
  }

  // Clear old messages (older than 24 hours)
  clearOldMessages(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.messages = this.messages.filter(msg => msg.timestamp > oneDayAgo);
  }
}

// Export singleton instance
export const dashboardCommunicationService = new DashboardCommunicationService();
export type { DashboardMessage, DashboardStats, DashboardRole };
