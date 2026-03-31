/**
 * Dashboard Sync Service
 * Enables real-time communication between Candidate, Employer, and Admin dashboards
 */

type DashboardType = 'candidate' | 'employer' | 'admin';
type SyncEventType = 'update' | 'refresh' | 'notify' | 'sync';

interface SyncEvent {
  type: SyncEventType;
  dashboard: DashboardType;
  data: any;
  timestamp: number;
}

class DashboardSyncService {
  private listeners: Map<DashboardType, Set<(event: SyncEvent) => void>> = new Map();
  private eventHistory: SyncEvent[] = [];
  private maxHistorySize = 50;

  constructor() {
    this.initializeListeners();
  }

  private initializeListeners() {
    const dashboards: DashboardType[] = ['candidate', 'employer', 'admin'];
    dashboards.forEach(dashboard => {
      this.listeners.set(dashboard, new Set());
    });
  }

  /**
   * Subscribe to dashboard sync events
   */
  subscribe(dashboard: DashboardType, callback: (event: SyncEvent) => void): () => void {
    const listeners = this.listeners.get(dashboard);
    if (listeners) {
      listeners.add(callback);
    }

    // Return unsubscribe function
    return () => {
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Emit sync event to all dashboards
   */
  emit(type: SyncEventType, sourceDashboard: DashboardType, data: any) {
    const event: SyncEvent = {
      type,
      dashboard: sourceDashboard,
      data,
      timestamp: Date.now()
    };

    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify all dashboards
    const dashboards: DashboardType[] = ['candidate', 'employer', 'admin'];
    dashboards.forEach(dashboard => {
      const listeners = this.listeners.get(dashboard);
      if (listeners) {
        listeners.forEach(callback => {
          try {
            callback(event);
          } catch (error) {
            console.error(`Error in dashboard sync listener for ${dashboard}:`, error);
          }
        });
      }
    });

    // Broadcast via localStorage for cross-tab communication
    try {
      localStorage.setItem('dashboardSync', JSON.stringify(event));
    } catch (error) {
      console.warn('Failed to broadcast via localStorage:', error);
    }
  }

  /**
   * Emit update event (data changed)
   */
  emitUpdate(dashboard: DashboardType, data: any) {
    this.emit('update', dashboard, data);
  }

  /**
   * Emit refresh event (request data refresh)
   */
  emitRefresh(dashboard: DashboardType, data?: any) {
    this.emit('refresh', dashboard, data || {});
  }

  /**
   * Emit notification event
   */
  emitNotify(dashboard: DashboardType, message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
    this.emit('notify', dashboard, { message, type });
  }

  /**
   * Emit sync event (full sync)
   */
  emitSync(dashboard: DashboardType, data: any) {
    this.emit('sync', dashboard, data);
  }

  /**
   * Get event history
   */
  getHistory(): SyncEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Clear event history
   */
  clearHistory() {
    this.eventHistory = [];
  }

  /**
   * Get last event for a dashboard
   */
  getLastEvent(dashboard: DashboardType): SyncEvent | undefined {
    return this.eventHistory.find(event => event.dashboard === dashboard);
  }
}

// Export singleton instance
export const dashboardSyncService = new DashboardSyncService();
export type { SyncEvent, SyncEventType, DashboardType };
