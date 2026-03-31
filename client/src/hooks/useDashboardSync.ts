import { useEffect, useCallback } from 'react';
import { dashboardSyncService, type DashboardType, type SyncEvent } from '../services/dashboardSyncService';

/**
 * Hook for dashboard synchronization
 * Enables communication between Candidate, Employer, and Admin dashboards
 */
export const useDashboardSync = (
  currentDashboard: DashboardType,
  onUpdate?: (event: SyncEvent) => void,
  onRefresh?: (event: SyncEvent) => void,
  onNotify?: (event: SyncEvent) => void,
  onSync?: (event: SyncEvent) => void
) => {
  useEffect(() => {
    // Subscribe to sync events
    const unsubscribe = dashboardSyncService.subscribe(currentDashboard, (event) => {
      try {
        switch (event.type) {
          case 'update':
            onUpdate?.(event);
            break;
          case 'refresh':
            onRefresh?.(event);
            break;
          case 'notify':
            onNotify?.(event);
            break;
          case 'sync':
            onSync?.(event);
            break;
        }
      } catch (error) {
        console.error('Error handling dashboard sync event:', error);
      }
    });

    // Listen for storage events (cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dashboardSync' && e.newValue) {
        try {
          const event = JSON.parse(e.newValue) as SyncEvent;
          if (event.dashboard !== currentDashboard) {
            // Event from another dashboard
            switch (event.type) {
              case 'update':
                onUpdate?.(event);
                break;
              case 'refresh':
                onRefresh?.(event);
                break;
              case 'notify':
                onNotify?.(event);
                break;
              case 'sync':
                onSync?.(event);
                break;
            }
          }
        } catch (error) {
          console.error('Error parsing dashboard sync event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentDashboard, onUpdate, onRefresh, onNotify, onSync]);

  // Return utility functions
  const emitUpdate = useCallback((data: any) => {
    dashboardSyncService.emitUpdate(currentDashboard, data);
  }, [currentDashboard]);

  const emitRefresh = useCallback((data?: any) => {
    dashboardSyncService.emitRefresh(currentDashboard, data);
  }, [currentDashboard]);

  const emitNotify = useCallback((message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    dashboardSyncService.emitNotify(currentDashboard, message, type);
  }, [currentDashboard]);

  const emitSync = useCallback((data: any) => {
    dashboardSyncService.emitSync(currentDashboard, data);
  }, [currentDashboard]);

  return {
    emitUpdate,
    emitRefresh,
    emitNotify,
    emitSync,
    getHistory: () => dashboardSyncService.getHistory(),
    getLastEvent: () => dashboardSyncService.getLastEvent(currentDashboard)
  };
};
