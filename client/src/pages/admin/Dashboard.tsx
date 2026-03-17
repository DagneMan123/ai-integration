import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../utils/api';
import { DashboardData } from '../../types';
import Loading from '../../components/Loading';
import DashboardLayout from '../../components/DashboardLayout';
import { adminMenu } from '../../config/menuConfig';
import toast from 'react-hot-toast';
import { useDashboardCommunication } from '../../hooks/useDashboardCommunication';
import { useSessionMonitoring } from '../../hooks/useSessionMonitoring';
import { 
  Users, 
  Briefcase, 
  Video, 
  Wallet, 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  TrendingUp,
  AlertCircle,
  Activity,
  CheckCircle2
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Session monitoring
  useSessionMonitoring();

  const { broadcastDataUpdate, notifyStatusChange, sendNotification } = useDashboardCommunication({
    role: 'admin',
    enableAutoToasts: false // Admin handles custom toasts
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await analyticsAPI.getAdminDashboard();
      const dashboardData = response.data.data || null;
      setData(dashboardData);
      
      if (dashboardData) {
        broadcastDataUpdate(dashboardData);
        notifyStatusChange('system-sync-complete', { timestamp: new Date().toISOString() });
      }
    } catch (error) {
      toast.error('System synchronization failed');
      sendNotification('Critical: Admin dashboard data fetch failed', 'high');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [broadcastDataUpdate, notifyStatusChange, sendNotification]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // 1 minute sync
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    toast.success('Platform data refreshed');
  };

  if (loading) return <Loading fullScreen message="Initializing Command Center..." />;

  return (
    <DashboardLayout menuItems={adminMenu} role="admin">
      <div className="space-y-10 animate-in fade-in duration-700">
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Command Center</h1>
            <p className="text-slate-500 font-medium mt-1">Real-time platform oversight and infrastructure monitoring</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="group flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
            Sync Platform Data
          </button>
        </div>

        {/* High-Level Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Total Users" 
            value={data?.totalUsers || 0} 
            subtitle="Registered accounts"
            icon={Users}
            color="indigo"
          />
          <MetricCard 
            title="Job Listings" 
            value={data?.totalJobs || 0} 
            subtitle="Active vacancies"
            icon={Briefcase}
            color="emerald"
          />
          <MetricCard 
            title="AI Sessions" 
            value={data?.totalInterviews || 0} 
            subtitle="Interviews conducted"
            icon={Video}
            color="purple"
          />
          <MetricCard 
            title="Net Revenue" 
            value={`ETB ${(data?.totalRevenue || 0).toLocaleString()}`} 
            subtitle="Platform earnings"
            icon={Wallet}
            color="amber"
          />
        </div>

        {/* Verification and Activity Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Action Queue */}
          <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Action Queue</h2>
              <span className="p-2 bg-rose-50 text-rose-500 rounded-lg"><AlertCircle size={20}/></span>
            </div>
            
            <div className="space-y-4">
              <Link to="/admin/companies" className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm">
                      <ShieldCheck size={20} />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-900">Companies</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Pending Audit</p>
                   </div>
                </div>
                <span className="text-xl font-black text-slate-900">{data?.pendingCompanies || 0}</span>
              </Link>

              <Link to="/admin/jobs" className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm">
                      <Briefcase size={20} />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-900">Job Posts</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Awaiting Review</p>
                   </div>
                </div>
                <span className="text-xl font-black text-slate-900">{data?.pendingJobs || 0}</span>
              </Link>
            </div>

            <Link to="/admin/analytics" className="mt-8 flex items-center justify-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest hover:gap-4 transition-all">
              Platform Health Reports <ArrowRight size={14} />
            </Link>
          </div>

          {/* System Audit Trail */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">System Audit Trail</h2>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black tracking-tighter uppercase">
                   <Activity size={10} /> Live
                </div>
              </div>
              <Link to="/admin/logs" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1">
                Full Log <Clock size={14} />
              </Link>
            </div>

            <div className="space-y-6">
              {data?.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((activity: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className="mt-1 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-indigo-500 transition-colors shrink-0"></div>
                    <div className="flex-1 border-b border-slate-50 pb-4">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-800">{activity.action}</p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{activity.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Activity size={48} className="opacity-10 mb-4" />
                  <p className="text-sm font-medium italic">No recent platform activity logged</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ShortcutCard 
            to="/admin/users" 
            label="User Directory" 
            description="Manage candidate & employer accounts"
            icon={Users}
          />
          <ShortcutCard 
            to="/admin/companies" 
            label="Partner Audit" 
            description="Authorize and verify organizations"
            icon={CheckCircle2}
          />
          <ShortcutCard 
            to="/admin/analytics" 
            label="System Insights" 
            description="Monitor performance metrics"
            icon={TrendingUp}
          />
          <ShortcutCard 
            to="/admin/logs" 
            label="Security Logs" 
            description="Review platform security events"
            icon={ShieldCheck}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

// Sub-components for cleaner structure
const MetricCard = ({ title, value, subtitle, icon: Icon, color }: any) => {
  const colorMap: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className={`w-12 h-12 ${colorMap[color]} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
        <Icon size={24} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
      <p className="text-xs text-slate-500 font-medium mt-1">{subtitle}</p>
    </div>
  );
};

const ShortcutCard = ({ to, label, description, icon: Icon }: any) => (
  <Link 
    to={to} 
    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
  >
    <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-all duration-500">
      <Icon size={24} />
    </div>
    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{label}</h3>
    <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">{description}</p>
    <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
      Open Module <ArrowRight size={14} />
    </div>
  </Link>
);

export default AdminDashboard;