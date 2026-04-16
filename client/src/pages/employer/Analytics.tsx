import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { employerMenu } from '../../config/menuConfig';
import { 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp, 
  Calendar, 
  Download, 
  Briefcase, 
  ArrowUpRight, 
  ArrowDownRight,
  BrainCircuit
} from 'lucide-react';

const EmployerAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Last 30 Days');

  return (
    <DashboardLayout menuItems={employerMenu} role="employer">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hiring Analytics</h1>
            <p className="text-gray-500 font-medium">Real-time insights into your recruitment performance</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm appearance-none cursor-pointer"
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 6 Months</option>
                <option>Year to Date</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Applicants" value="1,284" trend="+12%" isUp={true} icon={<Users className="text-blue-600" />} color="blue" />
          <StatCard title="AI Pass Rate" value="64%" trend="+5%" isUp={true} icon={<Target className="text-emerald-600" />} color="emerald" />
          <StatCard title="Avg. AI Score" value="72.8" trend="-2%" isUp={false} icon={<BrainCircuit className="text-purple-600" />} color="purple" />
          <StatCard title="Active Jobs" value="12" trend="0%" isUp={null} icon={<Briefcase className="text-orange-600" />} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Visual Graph - Hiring Pipeline */}
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-900">Application Trends</h3>
                <p className="text-sm text-gray-400 font-medium">Daily submission volume</p>
              </div>
              <BarChart3 className="text-gray-300 w-6 h-6" />
            </div>
            
            {/* Simple CSS-based Graph Placeholder (In production use Recharts or Chart.js) */}
            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {[40, 70, 45, 90, 65, 80, 50, 95, 60, 85, 40, 75].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                  <div 
                    className="w-full bg-blue-50 rounded-t-lg group-hover:bg-blue-600 transition-all duration-500 cursor-pointer" 
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {h*2}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
            </div>
          </div>

          {/* AI Score Distribution */}
          <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
            <h3 className="text-xl font-black text-gray-900 mb-6">Candidate Quality</h3>
            <div className="space-y-6">
              <ScoreProgress label="Expert (90-100)" count={124} percentage={15} color="bg-emerald-500" />
              <ScoreProgress label="Proficient (70-89)" count={458} percentage={55} color="bg-blue-500" />
              <ScoreProgress label="Intermediate (50-69)" count={280} percentage={25} color="bg-amber-500" />
              <ScoreProgress label="Novice (<50)" count={42} percentage={5} color="bg-rose-500" />
            </div>
            
            <div className="mt-10 p-5 bg-blue-50 rounded-3xl border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-black text-blue-900 uppercase tracking-tight">AI Insight</span>
              </div>
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                Candidate quality has increased by 14% since you implemented technical skill screening.
              </p>
            </div>
          </div>

          {/* Top Postings Table */}
          <div className="lg:col-span-12 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">Top Performing Job Posts</h3>
              <button className="text-sm font-bold text-blue-600 hover:underline">View All Posts</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Job Title</th>
                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Impressions</th>
                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Applicants</th>
                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Conversion</th>
                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">AI Success</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                  <JobRow title="Senior React Developer" views="4.2k" apps="184" conv="4.3%" success="72%" />
                  <JobRow title="UI/UX Designer" views="2.8k" apps="92" conv="3.2%" success="58%" />
                  <JobRow title="Backend Engineer (Node)" views="3.1k" apps="145" conv="4.6%" success="81%" />
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

/* --- Helper Components --- */

const StatCard = ({ title, value, trend, isUp, icon, color }: any) => {
  const colors: any = {
    blue: "bg-blue-50/50 border-blue-100 text-blue-600",
    emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-600",
    purple: "bg-purple-50/50 border-purple-100 text-purple-600",
    orange: "bg-orange-50/50 border-orange-100 text-orange-600",
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]}`}>
          {React.cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
        {isUp !== null && (
          <span className={`flex items-center text-xs font-black ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isUp ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
    </div>
  );
};

const ScoreProgress = ({ label, count, percentage, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-400">{count} candidates</span>
    </div>
    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
    </div>
  </div>
);

const JobRow = ({ title, views, apps, conv, success }: any) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-8 py-5 font-bold text-gray-900">{title}</td>
    <td className="px-8 py-5 text-gray-500 font-mono text-sm">{views}</td>
    <td className="px-8 py-5 text-gray-500 font-mono text-sm">{apps}</td>
    <td className="px-8 py-5">
      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">{conv}</span>
    </td>
    <td className="px-8 py-5">
      <div className="flex items-center gap-2">
        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: success }} />
        </div>
        <span className="text-xs font-bold text-emerald-600">{success}</span>
      </div>
    </td>
  </tr>
);

export default EmployerAnalytics;