import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  Video, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar
} from 'lucide-react';
import api from '../../utils/api';
import Loading from '../../components/Loading';

interface AnalyticsData {
  totalCandidates: number;
  activeEmployers: number;
  aiInterviews: number;
  platformRevenue: string;
  candidatesTrend: string;
  employersTrend: string;
  interviewsTrend: string;
  revenueTrend: string;
  interviewData: number[];
  sectorData: Array<{ name: string; value: number; color: string }>;
  events: Array<{ id: number; source: string; action: string; status: string; timestamp: string }>;
}

// Reusable KPI Card Component
const KPICard = ({ title, value, trend, icon: Icon, trendType }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600">
        <Icon size={24} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
        trendType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
      }`}>
        {trendType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trend}
      </div>
    </div>
    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
    <h3 className="text-3xl font-black text-slate-900 mt-1">{value}</h3>
  </div>
);

const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/admin/analytics');
        const analyticsData = response.data?.data || {};
        
        setData({
          totalCandidates: analyticsData.candidateCount || 0,
          activeEmployers: analyticsData.employerCount || 0,
          aiInterviews: analyticsData.totalInterviews || 0,
          platformRevenue: `$${analyticsData.totalRevenue || 0}`,
          candidatesTrend: analyticsData.candidateTrend || '0%',
          employersTrend: analyticsData.employerTrend || '0%',
          interviewsTrend: analyticsData.interviewTrend || '0%',
          revenueTrend: analyticsData.revenueTrend || '0%',
          interviewData: analyticsData.interviewData || [],
          sectorData: analyticsData.sectorData || [],
          events: analyticsData.events || []
        });
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-8 animate-in fade-in duration-700 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Analytics</h1>
          <p className="text-slate-500 font-medium">Real-time performance metrics across SimuAI ecosystem</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            <Calendar size={18} />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      {loading && <Loading />}

      {!loading && !error && data && (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
              title="Total Candidates" 
              value={data.totalCandidates.toLocaleString()} 
              trend={data.candidatesTrend} 
              icon={Users} 
              trendType={data.candidatesTrend.includes('+') ? 'up' : 'down'} 
            />
            <KPICard 
              title="Active Employers" 
              value={data.activeEmployers.toLocaleString()} 
              trend={data.employersTrend} 
              icon={Building2} 
              trendType={data.employersTrend.includes('+') ? 'up' : 'down'} 
            />
            <KPICard 
              title="AI Interviews" 
              value={data.aiInterviews.toLocaleString()} 
              trend={data.interviewsTrend} 
              icon={Video} 
              trendType={data.interviewsTrend.includes('+') ? 'up' : 'down'} 
            />
            <KPICard 
              title="Platform Revenue" 
              value={data.platformRevenue} 
              trend={data.revenueTrend} 
              icon={DollarSign} 
              trendType={data.revenueTrend.includes('+') ? 'up' : 'down'} 
            />
          </div>

          {/* Main Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Growth Chart Placeholder */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Interview Volume Growth</h3>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                     <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>
                     <span className="text-xs font-bold text-slate-500">Completed</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="w-3 h-3 bg-slate-200 rounded-full"></span>
                     <span className="text-xs font-bold text-slate-500">Scheduled</span>
                   </div>
                </div>
              </div>
              
              {/* Chart Placeholder Visualization */}
              <div className="h-[300px] w-full bg-slate-50 rounded-3xl flex items-end justify-between p-6 gap-2">
                {data.interviewData.map((height, i) => (
                  <div 
                    key={i} 
                    className="w-full bg-indigo-600/20 rounded-t-lg transition-all hover:bg-indigo-600"
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between mt-4 px-2">
                 {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                   <span key={m} className="text-[10px] font-bold text-slate-400 uppercase">{m}</span>
                 ))}
              </div>
            </div>

            {/* Sector Distribution */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200">
              <h3 className="text-lg font-black uppercase tracking-tight mb-8">Top Industry Sectors</h3>
              <div className="space-y-6">
                {data.sectorData.map((sector) => (
                  <div key={sector.name} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                      <span className="text-slate-400">{sector.name}</span>
                      <span>{sector.value}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${sector.color} rounded-full`}
                        style={{ width: `${sector.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-emerald-400" size={20} />
                  <p className="text-xs font-medium text-slate-300 leading-relaxed">
                    <span className="text-white font-bold">Tech sector</span> has seen a 24% increase in interview completions this week.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Health Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Recent Platform Events</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Source</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.events.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No recent events
                      </td>
                    </tr>
                  ) : (
                    data.events.map((event) => (
                      <tr key={event.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                              {event.source.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-slate-700">{event.source}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-slate-500 font-medium italic">{event.action}</td>
                        <td className="py-4">
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-md">{event.status}</span>
                        </td>
                        <td className="py-4 text-xs font-bold text-slate-400">{event.timestamp}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;