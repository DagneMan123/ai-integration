import { EventEmitter } from 'events';
import { DashboardData } from '../types';

export type DashboardRole = 'admin' | 'employer' | 'candidate';

export interface DashboardEvent {
  id: string;
  type: 'data-update' | 'status-change' | 'action-required' | 'notification' | 'sync-request';
  source: DashboardRole;
  target?: DashboardRole | 'all';
  payload: any;
  timestamp: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  originTabId: string;
}

class DashboardCommunicationService extends EventEmitter {
  private dashboardStates: Map<string, any> = new Map();
  private eventHistory: DashboardEvent[] = [];
  private readonly maxHistorySize = 50;
  private channel: BroadcastChannel;
  private tabId: string;

  constructor() {
    super();
    this.tabId = Math.random().toString(36).substring(2, 11);
    this.setMaxListeners(50);
    
    this.channel = new BroadcastChannel('simuai_dashboard_sync');
    this.initializeBroadcastListeners();
    this.loadStateFromStorage();
  }

  private initializeBroadcastListeners() {
    this.channel.onmessage = (event) => {
      const dashboardEvent: DashboardEvent = event.data;
      if (dashboardEvent.originTabId !== this.tabId) {
        this.emit(`dashboard:${dashboardEvent.type}`, dashboardEvent);
        this.emit('dashboard:event', dashboardEvent);
        this.syncLocalMemory(dashboardEvent);
      }
    };
  }

  private syncLocalMemory(event: DashboardEvent) {
    if (event.type === 'data-update') {
      this.dashboardStates.set(event.source, event.payload);
    }
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) this.eventHistory.shift();
  }

  private loadStateFromStorage() {
    try {
      const saved = localStorage.getItem('simuai_dashboard_states');
      if (saved) this.dashboardStates = new Map(JSON.parse(saved));
    } catch (e) { console.error("Storage load failed", e); }
  }

  private saveToStorage() {
    localStorage.setItem('simuai_dashboard_states', JSON.stringify([...this.dashboardStates]));
  }

  registerDashboard(role: DashboardRole) {
    this.dashboardStates.set(role, {});
  }

  unregisterDashboard(role: DashboardRole) {
    this.dashboardStates.delete(role);
  }

  broadcastEvent(event: Omit<DashboardEvent, 'id' | 'timestamp' | 'originTabId'>): void {
    const fullEvent: DashboardEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      originTabId: this.tabId,
    };

    this.emit(`dashboard:${fullEvent.type}`, fullEvent);
    this.emit('dashboard:event', fullEvent);
    this.syncLocalMemory(fullEvent);
    this.saveToStorage();

    this.channel.postMessage(fullEvent);

    if (process.env.NODE_ENV === 'development') {
      console.log(`%c[Sync] ${fullEvent.source} -> ${fullEvent.type}`, 'color: #2563eb; font-weight: bold', fullEvent.payload);
    }
  }

  updateDashboardData(role: DashboardRole, data: DashboardData) {
    this.broadcastEvent({
      type: 'data-update',
      source: role,
      target: 'all',
      payload: data,
      priority: 'normal'
    });
  }

  notifyStatusChange(source: DashboardRole, status: string, details: any = {}) {
    this.broadcastEvent({
      type: 'status-change',
      source,
      target: 'all',
      payload: { status, details },
      priority: 'normal'
    });
  }

  requestAction(source: DashboardRole, target: DashboardRole, action: string, data: any = {}) {
    this.broadcastEvent({
      type: 'action-required',
      source,
      target,
      payload: { action, data },
      priority: 'high'
    });
  }

  sendNotification(source: DashboardRole, message: string, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal') {
    this.broadcastEvent({
      type: 'notification',
      source,
      target: 'all',
      payload: { message },
      priority
    });
  }

  requestSync(source: DashboardRole, target?: DashboardRole) {
    this.broadcastEvent({
      type: 'sync-request',
      source,
      target: target || 'all',
      payload: { requestedAt: Date.now() },
      priority: 'high'
    });
  }

  getDashboardState(role: DashboardRole) {
    return this.dashboardStates.get(role);
  }

  getAllDashboardStates(): Map<string, any> {
    return new Map(this.dashboardStates);
  }

  getEventHistory(limit: number = 20): DashboardEvent[] {
    return this.eventHistory.slice(-limit);
  }

  onDashboardEvent(eventType: DashboardEvent['type'], callback: (event: DashboardEvent) => void): void {
    this.on(`dashboard:${eventType}`, callback);
  }

  onAnyEvent(callback: (event: DashboardEvent) => void): void {
    this.on('dashboard:event', callback);
  }

  offDashboardEvent(eventType: DashboardEvent['type'], callback: (event: DashboardEvent) => void): void {
    this.off(`dashboard:${eventType}`, callback);
  }

  getHealthStatus() {
    return {
      isHealthy: this.dashboardStates.size > 0,
      registeredDashboards: this.dashboardStates.size,
      eventHistorySize: this.eventHistory.length,
      lastEventTime: this.eventHistory.length > 0 ? this.eventHistory[this.eventHistory.length - 1].timestamp : null,
    };
  }

  destroy() {
    this.channel.close();
    this.removeAllListeners();
  }
}

export const dashboardService = new DashboardCommunicationService();

export default dashboardService;
