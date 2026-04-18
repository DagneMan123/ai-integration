import React, { useState, useEffect } from 'react';
import { Activity, Database, Cpu, HardDrive, CheckCircle, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

interface HealthData {
  status: string;
  database: string;
  timestamp: string;
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
  };
}

export const SystemHealth: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const response = await apiService.get('/dashboard-enhanced/admin/system-health');
      if ((response as any)?.data?.data) {
        setHealth((response as any).data.data);
      }
    } catch (err) {
      console.error('Failed to load system health:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getMemoryPercentage = () => {
    if (!health?.memory) return 0;
    return Math.round((health.memory.heapUsed / health.memory.heapTotal) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!health) {
    return <div className="text-center text-gray-500">No health data available</div>;
  }

  const memoryPercentage = getMemoryPercentage();
  const isHealthy = health.status === 'OK';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          System Health
        </h2>
        <div className="flex items-center gap-2">
          {isHealthy ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-sm font-semibold text-green-600">HEALTHY</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 text-red-600" />
              <span className="text-sm font-semibold text-red-600">UNHEALTHY</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Database Status */}
        <div className={`rounded-lg p-4 border-2 ${
          health.database === 'connected'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Database</p>
              <p className={`text-lg font-bold ${
                health.database === 'connected' ? 'text-green-600' : 'text-red-600'
              }`}>
                {health.database === 'connected' ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            <Database className={`w-8 h-8 ${
              health.database === 'connected' ? 'text-green-600' : 'text-red-600'
            }`} />
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Uptime</p>
              <p className="text-lg font-bold text-blue-600">
                {formatUptime(health.uptime)}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Memory Usage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-600" />
            Memory Usage
          </h3>
          <span className="text-sm font-semibold text-gray-800">
            {health.memory.heapUsed}MB / {health.memory.heapTotal}MB
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              memoryPercentage > 80 ? 'bg-red-600' :
              memoryPercentage > 60 ? 'bg-yellow-600' :
              'bg-green-600'
            }`}
            style={{ width: `${memoryPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {memoryPercentage}% of heap memory in use
        </p>
      </div>

      {/* Last Updated */}
      <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
        Last updated: {new Date(health.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};
