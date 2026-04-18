import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

interface APIMetric {
  endpoint: string;
  calls: number;
  avgResponseTime: number;
  errorRate: number;
}

interface APIUsageData {
  totalCalls: number;
  totalErrors: number;
  avgResponseTime: number;
  topEndpoints: APIMetric[];
}

export const APIUsageAnalytics: React.FC = () => {
  const [apiData, setApiData] = useState<APIUsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPIUsage();
    const interval = setInterval(fetchAPIUsage, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAPIUsage = async () => {
    try {
      const response = await apiService.get('/dashboard-enhanced/admin');
      if ((response as any)?.data?.apiUsage) {
        setApiData((response as any).data.apiUsage);
      }
    } catch (err) {
      console.error('Failed to load API usage:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!apiData) {
    return <div className="text-center text-gray-500">No API usage data available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        API Usage Analytics
      </h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total Calls */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Total API Calls</p>
          <p className="text-3xl font-bold text-blue-600">{apiData.totalCalls.toLocaleString()}</p>
          <p className="text-xs text-gray-600 mt-2">Last 24 hours</p>
        </div>

        {/* Avg Response Time */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-gray-600 mb-2">Avg Response Time</p>
          <p className="text-3xl font-bold text-green-600">{apiData.avgResponseTime}ms</p>
          <p className="text-xs text-gray-600 mt-2">Across all endpoints</p>
        </div>

        {/* Total Errors */}
        <div className={`rounded-lg p-4 border ${
          apiData.totalErrors > 100
            ? 'bg-red-50 border-red-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <p className="text-sm text-gray-600 mb-2">Total Errors</p>
          <p className={`text-3xl font-bold ${
            apiData.totalErrors > 100 ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {apiData.totalErrors}
          </p>
          <p className="text-xs text-gray-600 mt-2">Last 24 hours</p>
        </div>
      </div>

      {/* Top Endpoints */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Top Endpoints
        </h3>
        <div className="space-y-3">
          {apiData.topEndpoints.map((endpoint, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">{endpoint.endpoint}</h4>
                <span className="text-sm font-semibold text-blue-600">
                  {endpoint.calls} calls
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Avg Response Time</p>
                  <p className="font-semibold text-gray-800">{endpoint.avgResponseTime}ms</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-gray-600">Error Rate</p>
                  <div className="flex items-center gap-1">
                    {endpoint.errorRate > 5 && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <p className={`font-semibold ${
                      endpoint.errorRate > 5 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {endpoint.errorRate}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
