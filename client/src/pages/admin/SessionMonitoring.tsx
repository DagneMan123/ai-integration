import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, Zap, Loader } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminMenu } from '../../config/menuConfig';
import api from '../../utils/api';

interface Session {
  id: string;
  candidateName: string;
  jobTitle: string;
  status: 'active' | 'completed' | 'flagged';
  startTime: string;
  duration: number;
  integrityScore: number;
  suspiciousActivities: number;
}

const SessionMonitoring: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/interviews');
      const interviews = response.data?.data || [];
      
      // Transform interview data to session format
      const transformedSessions = interviews.map((interview: any) => ({
        id: interview.id,
        candidateName: `${interview.candidate?.firstName || 'Unknown'} ${interview.candidate?.lastName || ''}`,
        jobTitle: interview.job?.title || 'Unknown Position',
        status: interview.status === 'COMPLETED' ? 'completed' : interview.status === 'IN_PROGRESS' ? 'active' : 'flagged',
        startTime: interview.startedAt ? new Date(interview.startedAt).toLocaleTimeString() : 'N/A',
        duration: interview.startedAt && interview.completedAt 
          ? Math.round((new Date(interview.completedAt).getTime() - new Date(interview.startedAt).getTime()) / 60000)
          : 0,
        integrityScore: interview.integrityScore || 0,
        suspiciousActivities: interview.antiCheatData?.suspiciousActivities?.length || 0,
      }));
      
      setSessions(transformedSessions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sessions');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'flagged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Zap size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'flagged':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <DashboardLayout menuItems={adminMenu} role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Session Monitoring</h1>
          </div>
          <button 
            onClick={fetchSessions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Active Sessions</p>
                <p className="text-2xl font-bold text-blue-600">{sessions.filter(s => s.status === 'active').length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-600">{sessions.filter(s => s.status === 'completed').length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Flagged</p>
                <p className="text-2xl font-bold text-red-600">{sessions.filter(s => s.status === 'flagged').length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Avg Integrity</p>
                <p className="text-2xl font-bold text-purple-600">
                  {sessions.length > 0 ? Math.round(sessions.reduce((acc, s) => acc + s.integrityScore, 0) / sessions.length) : 0}%
                </p>
              </div>
            </div>

            {/* Sessions Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {sessions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Activity size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No sessions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Candidate</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Position</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Start Time</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Integrity</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Alerts</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sessions.map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{session.candidateName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{session.jobTitle}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                              {getStatusIcon(session.status)}
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{session.startTime}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{session.duration} min</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    session.integrityScore >= 80
                                      ? 'bg-green-500'
                                      : session.integrityScore >= 60
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${session.integrityScore}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{session.integrityScore}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-semibold ${session.suspiciousActivities > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {session.suspiciousActivities > 0 ? `${session.suspiciousActivities} alerts` : 'None'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SessionMonitoring;
