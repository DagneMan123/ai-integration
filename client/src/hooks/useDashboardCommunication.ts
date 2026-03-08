import { useEffect, useCallback, useRef } from 'react';
import dashboardService, { DashboardEvent } from '../services/dashboardService';
import { DashboardData } from '../types';

/**
 * Hook for dashboard communication
 * Enables dashboards to communicate professionally with each other
 */

export interface UseDashboardCommunicationOptions {
  role: 'admin' | 'employer' | 'candidate';
  onDataUpdate?: (event: DashboardEvent) => void;
  onStatusChange?: (event: DashboardEvent) => void;
  onActionRequired?: (event: DashboardEvent) => void;
  onNotification?: (event: DashboardEvent) => void;
  onSyncRequest?: (event: DashboardEvent) => void;
  onAnyEvent?: (event: DashboardEvent) => void;
}

export const useDashboardCommunication = (options: UseDashboardCommunicationOptions) => {
  const { role, onDataUpdate, onStatusChange, onActionRequired, onNotification, onSyncRequest, onAnyEvent } = options;
  const registeredRef = useRef(false);

  // Register dashboard on mount
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

  // Setup event listeners
  useEffect(() => {
    const listeners: Array<{ event: string; callback: (e: DashboardEvent) => void }> = [];

    if (onDataUpdate) {
      dashboardService.onDashboardEvent('data-update', onDataUpdate);
      listeners.push({ event: 'data-update', callback: onDataUpdate });
    }

    if (onStatusChange) {
      dashboardService.onDashboardEvent('status-change', onStatusChange);
      listeners.push({ event: 'status-change', callback: onStatusChange });
    }

    if (onActionRequired) {
      dashboardService.onDashboardEvent('action-required', onActionRequired);
      listeners.push({ event: 'action-required', callback: onActionRequired });
    }

    if (onNotification) {
      dashboardService.onDashboardEvent('notification', onNotification);
      listeners.push({ event: 'notification', callback: onNotification });
    }

    if (onSyncRequest) {
      dashboardService.onDashboardEvent('sync-request', onSyncRequest);
      listeners.push({ event: 'sync-request', callback: onSyncRequest });
    }

    if (onAnyEvent) {
      dashboardService.onAnyEvent(onAnyEvent);
      listeners.push({ event: 'any', callback: onAnyEvent });
    }

    return () => {
      listeners.forEach(({ event, callback }) => {
        if (event === 'any') {
          dashboardService.off('dashboard:event', callback);
        } else {
          dashboardService.offDashboardEvent(event as any, callback);
        }
      });
    };
  }, [onDataUpdate, onStatusChange, onActionRequired, onNotification, onSyncRequest, onAnyEvent]);

  // Broadcast data update
  const broadcastDataUpdate = useCallback(
    (data: DashboardData) => {
      dashboardService.updateDashboardData(role, data);
    },
    [role]
  );

  // Notify status change
  const notifyStatusChange = useCallback(
    (status: string, details: any = {}) => {
      dashboardService.notifyStatusChange(role, status, details);
    },
    [role]
  );

  // Request action from another dashboard
  const requestAction = useCallback(
    (target: 'admin' | 'employer' | 'candidate', action: string, data: any = {}) => {
      dashboardService.requestAction(role, target, action, data);
    },
    [role]
  );

  // Send notification
  const sendNotification = useCallback(
    (message: string, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal') => {
      dashboardService.sendNotification(role, message, priority);
    },
    [role]
  );

  // Request sync
  const requestSync = useCallback(
    (target?: 'admin' | 'employer' | 'candidate') => {
      dashboardService.requestSync(role, target);
    },
    [role]
  );

  // Get dashboard state
  const getDashboardState = useCallback(() => {
    return dashboardService.getDashboardState(role);
  }, [role]);

  // Get all dashboard states
  const getAllDashboardStates = useCallback(() => {
    return dashboardService.getAllDashboardStates();
  }, []);

  // Get event history
  const getEventHistory = useCallback((limit?: number) => {
    return dashboardService.getEventHistory(limit);
  }, []);

  return {
    broadcastDataUpdate,
    notifyStatusChange,
    requestAction,
    sendNotification,
    requestSync,
    getDashboardState,
    getAllDashboardStates,
    getEventHistory,
  };
};

export default useDashboardCommunication;
