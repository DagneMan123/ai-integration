import { useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import dashboardService, { DashboardEvent } from '../services/dashboardService';
import { DashboardData } from '../types';

/**
 * Enterprise Dashboard Communication Hook
 * Provides a standardized interface for real-time inter-dashboard events
 */

export type DashboardRole = 'admin' | 'employer' | 'candidate';
export type EventPriority = 'low' | 'normal' | 'high' | 'critical';

export interface UseDashboardCommunicationOptions {
  role: DashboardRole;
  onDataUpdate?: (event: DashboardEvent) => void;
  onStatusChange?: (event: DashboardEvent) => void;
  onActionRequired?: (event: DashboardEvent) => void;
  onNotification?: (event: DashboardEvent) => void;
  onSyncRequest?: (event: DashboardEvent) => void;
  onAnyEvent?: (event: DashboardEvent) => void;
  enableAutoToasts?: boolean; // Automatically show toasts for notifications
}

export const useDashboardCommunication = (options: UseDashboardCommunicationOptions) => {
  const { 
    role, 
    onDataUpdate, 
    onStatusChange, 
    onActionRequired, 
    onNotification, 
    onSyncRequest, 
    onAnyEvent,
    enableAutoToasts = true 
  } = options;

  const registeredRef = useRef(false);

  // 1. Dashboard Lifecycle Management
  useEffect(() => {
    if (!registeredRef.current) {
      dashboardService.registerDashboard(role);
      registeredRef.current = true;
    }

    return () => {
      if (registeredRef.current) {
        dashboardService.unregisterDashboard(role);
        registeredRef.current = false;
      }
    };
  }, [role]);

  // 2. Automated Notification Handler (UI Integration)
  const handleAutoToast = useCallback((event: DashboardEvent) => {
    if (!enableAutoToasts) return;

    const { message, priority } = event.payload;
    const style = { borderRadius: '12px', background: '#1e293b', color: '#fff', fontSize: '14px' };

    switch (priority as EventPriority) {
      case 'critical':
        toast.error(message, { icon: <AlertTriangle className="text-rose-500" />, duration: 6000, style });
        break;
      case 'high':
        toast(message, { icon: <Bell className="text-amber-500" />, style });
        break;
      case 'normal':
        toast.success(message, { icon: <CheckCircle2 className="text-emerald-500" />, style });
        break;
      default:
        toast(message, { icon: <Info className="text-blue-500" />, style });
    }
  }, [enableAutoToasts]);

  // 3. Event Listeners Orchestration
  useEffect(() => {
    const activeListeners: Array<{ type: string; handler: (e: DashboardEvent) => void }> = [];

    const subscribe = (type: string, handler?: (e: DashboardEvent) => void) => {
      if (handler) {
        dashboardService.onDashboardEvent(type as any, handler);
        activeListeners.push({ type, handler });
      }
    };

    // Mapping system events
    subscribe('data-update', onDataUpdate);
    subscribe('status-change', onStatusChange);
    subscribe('action-required', onActionRequired);
    subscribe('sync-request', onSyncRequest);
    
    // Notification listener with internal auto-toast logic
    const internalNotificationHandler = (e: DashboardEvent) => {
      handleAutoToast(e);
      onNotification?.(e);
    };
    subscribe('notification', internalNotificationHandler);

    if (onAnyEvent) {
      dashboardService.onAnyEvent(onAnyEvent);
      activeListeners.push({ type: 'any', handler: onAnyEvent });
    }

    // Comprehensive Cleanup
    return () => {
      activeListeners.forEach(({ type, handler }) => {
        if (type === 'any') {
          dashboardService.off('dashboard:event', handler);
        } else {
          dashboardService.offDashboardEvent(type as any, handler);
        }
      });
    };
  }, [onDataUpdate, onStatusChange, onActionRequired, onNotification, onSyncRequest, onAnyEvent, handleAutoToast]);

  // --- API Methods ---

  const broadcastDataUpdate = useCallback((data: DashboardData) => {
    dashboardService.updateDashboardData(role, data);
  }, [role]);

  const notifyStatusChange = useCallback((status: string, details: any = {}) => {
    dashboardService.notifyStatusChange(role, status, details);
  }, [role]);

  const requestAction = useCallback((target: DashboardRole, action: string, data: any = {}) => {
    dashboardService.requestAction(role, target, action, data);
  }, [role]);

  const sendNotification = useCallback((message: string, priority: EventPriority = 'normal') => {
    dashboardService.sendNotification(role, message, priority);
  }, [role]);

  const requestSync = useCallback((target?: DashboardRole) => {
    dashboardService.requestSync(role, target);
  }, [role]);

  const getDashboardState = useCallback(() => {
    return dashboardService.getDashboardState(role);
  }, [role]);

  return {
    broadcastDataUpdate,
    notifyStatusChange,
    requestAction,
    sendNotification,
    requestSync,
    getDashboardState,
    getSystemHealth: () => dashboardService.getAllDashboardStates(),
    getAuditTrail: (limit?: number) => dashboardService.getEventHistory(limit),
  };
};

export default useDashboardCommunication;