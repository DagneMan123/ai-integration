import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../utils/api';
import { DashboardData } from '../../types';
import Loading from '../../components/Loading';
import DashboardLayout from '../../components/DashboardLayout';
import SharedDashboardInfo from '../../components/SharedDashboardInfo';
import { candidateMenu } from '../../config/menuConfig';
import { useDashboardCommunication } from '../../hooks/useDashboardCommunication';
import { useSessionMonitoring } from '../../hooks/useSessionMonitoring';
import { 
  Briefcase, 
  Calendar, 
  Trophy, 
  RefreshCw, 
  Search, 
  ArrowRight, 
  UserCircle,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const CandidateDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session monitoring
  useSessionMonitoring();

  // Dashboard communication
  useDashboardCommunication('candidate');

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await analyticsAPI.getCandidateDashboard();
      const dashboardData = response.data.data;
      
      setData(dashboardData);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to sync dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) return <Loading />;

  // Helper to ensure we show the correct count (handles both number and array responses)
  const getCount = (val: any) => {
    if (Array.isArray(val)) return val.length;
    return val || 0;
  };

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="max-w-6xl mx-auto space-y-10 pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back! 👋</h1>
            <p className="text-gray-500 font-medium mt-1">Review your latest interview progress and applications.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="p-2.5 text-gray-500 hover:text-blue-600 bg-white border border-gray-100 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/jobs"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Search className="w-5 h-5" />
              Explore Jobs
            </Link>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Applications" 
            value={getCount(data?.applications)} 
            subtitle="Total jobs applied"
            icon={<Briefcase className="w-6 h-6 text-blue-600" />}
            color="blue"
          />
          <StatCard 
            title="Interviews" 
            value={getCount(data?.interviews)} 
            subtitle="Scheduled sessions"
            icon={<Calendar className="w-6 h-6 text-emerald-600" />}
            color="emerald"
          />
          <StatCard 
            title="Avg Score" 
            value={data?.averageScore ? `${data.averageScore.toFixed(1)}%` : 'N/A'} 
            subtitle="Performance accuracy"
            icon={<Trophy className="w-6 h-6 text-purple-600" />}
            color="purple"
          />
        </div>

        {/* Main Content: Recent Interviews */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Interviews</h2>
              <p className="text-sm text-gray-500 font-medium">Detailed performance history</p>
            </div>
            <Link to="/candidate/interviews" className="text-sm font-bold text-blue-600 hover:underline underline-offset-4">
              Full History
            </Link>
          </div>

          <div className="p-6 md:p-8">
            {data?.recentInterviews && data.recentInterviews.length > 0 ? (
              <div className="grid gap-4">
                {data.recentInterviews.map((interview: any) => (
                  <div key={interview.id} className="group flex flex-col md:flex-row md:items-center md:justify-between p-4 md:p-5 bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-blue-100 border border-transparent rounded-2xl transition-all gap-4 md:gap-0">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{interview.jobTitle || 'Role Not Specified'}</h4>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">{interview.companyName || 'Private Organization'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 md:gap-8 justify-between md:justify-end">
                      <div className="hidden md:block text-right">
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5 whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          {interview.date && !isNaN(Date.parse(interview.date)) 
                            ? new Date(interview.date).toLocaleDateString() 
                            : 'Pending Date'}
                        </p>
                        <p className="text-xs font-medium text-gray-400">Activity Date</p>
                      </div>
                      
                      {interview.score !== undefined && interview.score !== null && (
                        <div className="w-12 h-12 rounded-full border-4 border-blue-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-black text-blue-600">{interview.score}</span>
                        </div>
                      )}

                      <StatusBadge status={interview.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-200" />
                </div>
                <p className="text-gray-500 font-bold">No active sessions found</p>
                <p className="text-gray-400 text-sm">Apply for a job to start your AI interview.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <ActionCard 
            title="Professional Profile"
            desc="Keep your skills updated to match new job postings."
            link="/candidate/profile"
            icon={<UserCircle className="w-8 h-8 text-blue-600" />}
            btnText="Settings"
          />
          <ActionCard 
            title="Applications Tracker"
            desc="Track the status of all your current job submissions."
            link="/candidate/applications"
            icon={<Briefcase className="w-8 h-8 text-orange-600" />}
            btnText="View List"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

/* --- UI Sub-Components --- */

const StatCard = ({ title, value, subtitle, icon, color }: any) => {
  const colors: any = {
    blue: "bg-blue-50 border-blue-100",
    emerald: "bg-emerald-50 border-emerald-100",
    purple: "bg-purple-50 border-purple-100"
  };
  return (
    <div className={`p-6 rounded-[2rem] border shadow-sm ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">{title}</p>
          <h3 className="text-4xl font-black text-gray-900 mt-2">{value}</h3>
          <p className="text-sm font-medium text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="p-3 bg-white rounded-2xl shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status?.toUpperCase();
  const styles: any = {
    COMPLETED: "bg-emerald-100 text-emerald-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    SCHEDULED: "bg-amber-100 text-amber-700",
    PENDING: "bg-gray-100 text-gray-600",
    REJECTED: "bg-red-100 text-red-700"
  };
  return (
    <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight ${styles[normalizedStatus] || "bg-gray-100 text-gray-500"}`}>
      {status ? status.replace('_', ' ') : 'UNKNOWN'}
    </span>
  );
};

const ActionCard = ({ title, desc, link, icon, btnText }: any) => (
  <Link to={link} className="group p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
    <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 font-medium mb-6 leading-relaxed">{desc}</p>
    <div className="flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-wider">
      {btnText}
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
    </div>
  </Link>
);

export default CandidateDashboard;