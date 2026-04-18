import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import { apiService } from '../services/apiService';

interface Application {
  id: number;
  jobTitle: string;
  companyName: string;
  status: string;
  appliedAt: string;
  aiScore?: number;
}

export const ApplicationTracker: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/dashboard-enhanced/candidate');
      if ((response as any)?.data?.applications) {
        setApplications((response as any).data.applications);
      }
    } catch (err) {
      setError('Failed to load applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Briefcase className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-50 border-green-200';
      case 'REJECTED':
        return 'bg-red-50 border-red-200';
      case 'PENDING':
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-blue-600" />
          Application Tracker
        </h2>
        <span className="text-sm text-gray-600">{applications.length} applications</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No applications yet. Start applying to jobs!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className={`border rounded-lg p-4 flex items-center justify-between ${getStatusColor(app.status)}`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-shrink-0">
                  {getStatusIcon(app.status)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{app.jobTitle}</h3>
                  <p className="text-sm text-gray-600">{app.companyName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {app.aiScore && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600">{app.aiScore}%</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {new Date(app.appliedAt).toLocaleDateString()}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  app.status === 'ACCEPTED' ? 'bg-green-200 text-green-800' :
                  app.status === 'REJECTED' ? 'bg-red-200 text-red-800' :
                  app.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-blue-200 text-blue-800'
                }`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
