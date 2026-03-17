import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { dashboardCommunicationService, DashboardRole } from '../services/dashboardCommunicationService';

interface CrossDashboardSyncProps {
  role: DashboardRole;
}

interface SyncEvent {
  id: string;
  from: DashboardRole;
  action: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'error';
}

const CrossDashboardSync: React.FC<CrossDashboardSyncProps> = ({ role }) => {
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Subscribe to all message types to track sync events
    const unsubscribe = dashboardCommunicationService.subscribe('message-received', (message: any) => {
      const newEvent: SyncEvent = {
        id: message.id,
        from: message.from,
        action: message.title,
        timestamp: message.timestamp,
        status: 'success'
      };
      setSyncEvents(prev => [newEvent, ...prev].slice(0, 10)); // Keep last 10 events
    });

    return unsubscribe;
  }, []);

  const getStatusIcon = (status: SyncEvent['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'pending':
        return <Activity size={16} className="text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
    }
  };

  const getRoleColor = (role: DashboardRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'employer':
        return 'bg-blue-100 text-blue-700';
      case 'candidate':
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Sync Status Indicator */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        <Activity size={18} className="text-green-500 animate-pulse" />
        <span className="text-sm font-bold text-slate-900">Sync Active</span>
      </button>

      {/* Expanded Sync Panel */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4">
            <h3 className="font-bold text-sm">Cross-Dashboard Sync</h3>
            <p className="text-xs text-slate-300 mt-1">Real-time data transfer between dashboards</p>
          </div>

          {/* Events List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {syncEvents.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                <Activity size={24} className="mx-auto mb-2 opacity-50" />
                <p>Waiting for sync events...</p>
              </div>
            ) : (
              syncEvents.map(event => (
                <div key={event.id} className="p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getStatusIcon(event.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${getRoleColor(event.from)}`}>
                          {event.from.toUpperCase()}
                        </span>
                        <ArrowRight size={14} className="text-slate-400" />
                        <span className={`text-xs font-bold px-2 py-1 rounded ${getRoleColor(role)}`}>
                          {role.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 mt-1">{event.action}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-100 p-3 text-center">
            <button
              onClick={() => setSyncEvents([])}
              className="text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Clear History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrossDashboardSync;
