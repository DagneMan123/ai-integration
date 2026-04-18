import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { apiService } from '../services/apiService';

interface ErrorLog {
  id: number;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  endpoint?: string;
  userId?: number;
  resolved: boolean;
}

interface ErrorTrackingData {
  totalErrors: number;
  criticalErrors: number;
  unresolvedErrors: number;
  errors: ErrorLog[];
}

export const ErrorTracking: React.FC = () => {
  const [errorData, setErrorData] = useState<ErrorTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'unresolved'>('all');

  useEffect(() => {
    fetchErrors();
    const interval = setInterval(fetchErrors, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchErrors = async () => {
    try {
      const response = await apiService.get('/dashboard-enhanced/admin');
      if ((response as any)?.data?.errors) {
        setErrorData((response as any).data.errors);
      }
    } catch (err) {
      console.error('Failed to load errors:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'HIGH':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'MEDIUM':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-50 border-red-200';
      case 'HIGH':
        return 'bg-orange-50 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!errorData) {
    return <div className="text-center text-gray-500">No error data available</div>;
  }

  const filteredErrors = errorData.errors.filter(err => {
    if (filter === 'critical') return err.severity === 'CRITICAL';
    if (filter === 'unresolved') return !err.resolved;
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        Error Tracking
      </h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total Errors */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Total Errors</p>
          <p className="text-3xl font-bold text-blue-600">{errorData.totalErrors}</p>
          <p className="text-xs text-gray-600 mt-2">Last 24 hours</p>
        </div>

        {/* Critical Errors */}
        <div className={`rounded-lg p-4 border ${
          errorData.criticalErrors > 0
            ? 'bg-red-50 border-red-200'
            : 'bg-green-50 border-green-200'
        }`}>
          <p className="text-sm text-gray-600 mb-2">Critical Errors</p>
          <p className={`text-3xl font-bold ${
            errorData.criticalErrors > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {errorData.criticalErrors}
          </p>
          <p className="text-xs text-gray-600 mt-2">Requires attention</p>
        </div>

        {/* Unresolved Errors */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm text-gray-600 mb-2">Unresolved</p>
          <p className="text-3xl font-bold text-yellow-600">{errorData.unresolvedErrors}</p>
          <p className="text-xs text-gray-600 mt-2">Pending resolution</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Errors
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === 'critical'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Critical Only
        </button>
        <button
          onClick={() => setFilter('unresolved')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === 'unresolved'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Unresolved
        </button>
      </div>

      {/* Error List */}
      <div className="space-y-3">
        {filteredErrors.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">No errors found</p>
          </div>
        ) : (
          filteredErrors.map((error) => (
            <div
              key={error.id}
              className={`border rounded-lg p-4 ${getSeverityColor(error.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getSeverityIcon(error.severity)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{error.message}</h4>
                    {error.endpoint && (
                      <p className="text-sm text-gray-600 mt-1">Endpoint: {error.endpoint}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(error.timestamp).toLocaleString()}
                      </div>
                      {error.resolved && (
                        <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-semibold">
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${
                  error.severity === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                  error.severity === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                  error.severity === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-blue-200 text-blue-800'
                }`}>
                  {error.severity}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
