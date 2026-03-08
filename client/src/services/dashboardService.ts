import { EventEmitter } from 'events';
import { DashboardData } from '../types';

/**
 * Dashboard Communication Service
 * Enables professional inter-dashboard communication and data synchronization
 */

export interface DashboardEvent {
  type: 'data-update' | 'status-change' | 'action-required' | 'notification' | 'sync-request';
  source: 'admin' | 'employer' | 'candidate';
  target?: 'admin' | 'employer' | 'candidate' | 'all';
  payload: any;
  timestamp: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface DashboardState {
  role: 'admin' | 'employer' | 'candidate';
  data: DashboardData | null;
  lastUpdated: number;
  isRefreshing: boolean;
  errors: string[];
}

class DashboardCommunicationService extends EventEmitter {
  private dashboardStates: Map<string, DashboardState> = new Map();
  private eventHistory: DashboardEvent[] = [];
  private maxHistorySize = 100;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeService();
  }

  private initializeService(): void {
    // Set max listeners to prevent memory leaks
    this.setMaxListeners(20);
  }

  /**
   * Register a dashboard instance
   */
  registerDashboard(role: 'admin' | 'employer' | 'candidate'): void {
    this.dashboardStates.set(role, {
      role,
      data: null,
      lastUpdated: 0,
      isRefreshing: false,
      errors: [],
    });
  }

  /**
   * Unregister a dashboard instance
   */
  unregisterDashboard(role: 'admin' | 'employer' | 'candidate'): void {
    this.dashboardStates.delete(role);
  }

  /**
   * Broadcast a dashboard event to other dashboards
   */
  broadcastEvent(event: Omit<DashboardEvent, 'timestamp'>): void {
    const fullEvent: DashboardEvent = {
      ...event,
      timestamp: Date.now(),
    };

    // Store in history
    this.eventHistory.push(fullEvent);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Emit event
    this.emit(`dashboard:${event.type}`, fullEvent);
    this.emit('dashboard:event', fullEvent);

    // Log event
    console.log(`[Dashboard Event] ${event.source} → ${event.target || 'all'}:`, fullEvent);
  }

  /**
   * Update dashboard data
   */
  updateDashboardData(
    role: 'admin' | 'employer' | 'candidate',
    data: DashboardData
  ): void {
    const state = this.dashboardStates.get(role);
    if (state) {
      state.data = data;
      state.lastUpdated = Date.now();
      state.isRefreshing = false;

      this.broadcastEvent({
        type: 'data-update',
        source: role,
        target: 'all',
        payload: {
          role,
          dataKeys: Object.keys(data),
          timestamp: state.lastUpdated,
        },
        priority: 'normal',
      });
    }
  }

  /**
   * Notify about status changes
   */
  notifyStatusChange(
    source: 'admin' | 'employer' | 'candidate',
    status: string,
    details: any
  ): void {
    this.broadcastEvent({
      type: 'status-change',
      source,
      target: 'all',
      payload: { status, details },
      priority: 'normal',
    });
  }

  /**
   * Request action from another dashboard
   */
  requestAction(
    source: 'admin' | 'employer' | 'candidate',
    target: 'admin' | 'employer' | 'candidate',
    action: string,
    data: any
  ): void {
    this.broadcastEvent({
      type: 'action-required',
      source,
      target,
      payload: { action, data },
      priority: 'high',
    });
  }

  /**
   * Send a notification
   */
  sendNotification(
    source: 'admin' | 'employer' | 'candidate',
    message: string,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
  ): void {
    this.broadcastEvent({
      type: 'notification',
      source,
      target: 'all',
      payload: { message },
      priority,
    });
  }

  /**
   * Request data synchronization
   */
  requestSync(
    source: 'admin' | 'employer' | 'candidate',
    target?: 'admin' | 'employer' | 'candidate'
  ): void {
    this.broadcastEvent({
      type: 'sync-request',
      source,
      target: target || 'all',
      payload: { requestedAt: Date.now() },
      priority: 'high',
    });
  }

  /**
   * Get dashboard state
   */
  getDashboardState(role: 'admin' | 'employer' | 'candidate'): DashboardState | undefined {
    return this.dashboardStates.get(role);
  }

  /**
   * Get all dashboard states
   */
  getAllDashboardStates(): Map<string, DashboardState> {
    return new Map(this.dashboardStates);
  }

  /**
   * Get event history
   */
  getEventHistory(limit: number = 20): DashboardEvent[] {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Listen to specific dashboard events
   */
  onDashboardEvent(
    eventType: DashboardEvent['type'],
    callback: (event: DashboardEvent) => void
  ): void {
    this.on(`dashboard:${eventType}`, callback);
  }

  /**
   * Listen to all dashboard events
   */
  onAnyEvent(callback: (event: DashboardEvent) => void): void {
    this.on('dashboard:event', callback);
  }

  /**
   * Remove event listener
   */
  offDashboardEvent(
    eventType: DashboardEvent['type'],
    callback: (event: DashboardEvent) => void
  ): void {
    this.off(`dashboard:${eventType}`, callback);
  }

  /**
   * Clear event history
   */
  clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get service health status
   */
  getHealthStatus(): {
    isHealthy: boolean;
    registeredDashboards: number;
    eventHistorySize: number;
    lastEventTime: number | null;
  } {
    return {
      isHealthy: this.dashboardStates.size > 0,
      registeredDashboards: this.dashboardStates.size,
      eventHistorySize: this.eventHistory.length,
      lastEventTime: this.eventHistory.length > 0 ? this.eventHistory[this.eventHistory.length - 1].timestamp : null,
    };
  }

  /**
   * Cleanup service
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.removeAllListeners();
    this.dashboardStates.clear();
    this.eventHistory = [];
  }
}

// Export singleton instance
export const dashboardService = new DashboardCommunicationService();

export default dashboardService;
