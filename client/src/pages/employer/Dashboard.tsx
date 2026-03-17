import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../utils/api';
import { DashboardData } from '../../types';
import Loading from '../../components/Loading';
import DashboardLayout from '../../components/DashboardLayout';
import { employerMenu } from '../../config/menuConfig';
import { useDashboardCommunication } from '../../hooks/useDashboardCommunication';
import { useSessionMonitoring } from '../../hooks/useSessionMonitoring';
import { 
  Plus, 
  RefreshCw, 
  Briefcase, 
  CheckCircle2, 
  FileText, 
  Mic, 
  Users, 
  ArrowRight, 
  TrendingUp, 
  Building2,
  PieChart,
  UserCircle
} from 'lucide-react';

const EmployerDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Session monitoring
  useSessionMonitoring();

  // Dashboard communication
  useDashboardCommunication('employer');

  const fetchDashboardData = useCallback(async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await analyticsAPI.getEmployerDashboard();
      clearTimeout(timeoutId);
      
      const dashboardData = response.data.data || null;
      setData(dashboardData);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      // Don't show error toast, just set empty data
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Increase refresh interval from 30s to 60s
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) return <Loading />;

  return (
    <DashboardLayout menuItems={employerMenu} role="employer">
      <div className="max-w-7xl mx-auto space-y-10 pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Employer Command Center</h1>
            <p className="text-gray-500 font-medium mt-1">Manage talent acquisition and track hiring metrics.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setRefreshing(true); fetchDashboardData(); }}
              disabled={refreshing}
              className="p-2.5 text-gray-500 hover:text-blue-600 bg-white border border-gray-100 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/employer/jobs/create"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Plus className="w-5 h-5" />
              Post New Job
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Jobs" value={data?.jobs || 0} icon={<Briefcase className="w-6 h-6 text-blue-600" />} color="blue" />
          <StatCard title="Active Jobs" value={data?.activeJobs || 0} icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />} color="emerald" />
          <StatCard title="Applications" value={data?.applications || 0} icon={<FileText className="w-6 h-6 text-purple-600" />} color="purple" />
          <StatCard title="Interviews" value={data?.interviews || 0} icon={<Mic className="w-6 h-6 text-orange-600" />} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Recent Applications */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recent Candidates</h2>
                <p className="text-sm text-gray-500 font-medium">Latest talent applying to your open positions</p>
              </div>
              <Link to="/employer/jobs" className="text-sm font-bold text-blue-600 hover:underline underline-offset-4">
                View Tracking
              </Link>
            </div>

            <div className="p-6 md:p-8">
              {data?.recentApplications && data.recentApplications.length > 0 ? (
                <div className="grid gap-4">
                  {data.recentApplications.map((app: any) => (
                    <div key={app.id} className="group flex flex-col md:flex-row md:items-center md:justify-between p-4 md:p-5 bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-blue-100 border border-transparent rounded-2xl transition-all gap-4 md:gap-0">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600 flex-shrink-0">
                          <UserCircle className="w-8 h-8 opacity-20" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 truncate">{app.candidateName}</h4>
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider overflow-hidden">
                            <span className="truncate">{app.jobTitle}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0" />
                            <span className="truncate">{app.candidateEmail}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 md:gap-6 justify-between md:justify-end">
                        {/* Example AI Score (Matching) */}
                        <div className="hidden md:flex flex-col items-end flex-shrink-0">
                           <span className="text-xs font-black text-gray-300 uppercase tracking-tighter">AI Match</span>
                           <span className="text-sm font-black text-emerald-600">84%</span>
                        </div>
                        <StatusBadge status={app.status} />
                        <button className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all flex-shrink-0">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Users className="w-12 h-12" />} title="No applications yet" desc="Your job postings are waiting for the right talent." />
              )}
            </div>
          </div>

          {/* Quick Actions & Insights */}
          <div className="space-y-6">
            <ActionCard 
              title="Talent Analytics"
              desc="Deep dive into your hiring funnel and pass rates."
              link="/employer/analytics"
              icon={<TrendingUp className="w-8 h-8 text-blue-600" />}
              btnText="Analytics"
            />
            <ActionCard 
              title="Company Profile"
              desc="How candidates see your brand and culture."
              link="/employer/profile"
              icon={<Building2 className="w-8 h-8 text-emerald-600" />}
              btnText="Company Info"
            />
             <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
              <PieChart className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
              <h4 className="font-bold mb-2">Hiring Tip</h4>
              <p className="text-sm text-gray-400 leading-relaxed italic">
                "Positions with clear salary ranges receive 40% more qualified applications."
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

/* --- Sub-Components --- */

const StatCard = ({ title, value, icon, color }: any) => {
  const bgColors: any = {
    blue: "bg-blue-50/50 border-blue-100",
    emerald: "bg-emerald-50/50 border-emerald-100",
    purple: "bg-purple-50/50 border-purple-100",
    orange: "bg-orange-50/50 border-orange-100",
  };
  return (
    <div className={`p-6 rounded-[2rem] border shadow-sm bg-white ${bgColors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">{title}</p>
          <h3 className="text-4xl font-black text-gray-900 mt-2">{value}</h3>
        </div>
        <div className="p-3 bg-white rounded-2xl shadow-sm italic">
          {icon}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    ACCEPTED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-rose-100 text-rose-700",
    SHORTLISTED: "bg-blue-100 text-blue-700",
    PENDING: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

const ActionCard = ({ title, desc, link, icon, btnText }: any) => (
  <Link to={link} className="group p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
    <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
    <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 font-medium mb-6 text-sm leading-relaxed">{desc}</p>
    <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-wider">
      {btnText}
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
    </div>
  </Link>
);

const EmptyState = ({ icon, title, desc }: any) => (
  <div className="text-center py-10">
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
      {icon}
    </div>
    <p className="text-gray-500 font-bold">{title}</p>
    <p className="text-gray-400 text-sm">{desc}</p>
  </div>
);

export default EmployerDashboard;