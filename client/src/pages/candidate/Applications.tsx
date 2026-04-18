import React, { useEffect, useState } from 'react';
import { applicationAPI } from '../../utils/api';
import { Application } from '../../types';
import Loading from '../../components/Loading';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Search, 
  Filter,
  Trophy,
  XCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const CandidateApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await applicationAPI.getCandidateApplications();
      const appData = response.data.data || [];
      setApplications(appData);
    } catch (error) {
      console.error('Failed to fetch applications', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Derived state: Calculate stats directly from applications array
  const totalApplied = applications.length;
  const pendingCount = applications.filter(app => app.status.toUpperCase() === 'PENDING').length;
  const interviewingCount = applications.filter(app => app.status.toUpperCase() === 'INTERVIEWING').length;
  const offersCount = applications.filter(app => app.status.toUpperCase() === 'ACCEPTED' || app.status.toUpperCase() === 'HIRED').length;

  const getStatusDetails = (status: string) => {
    const statusMap: Record<string, { color: string, icon: any, label: string }> = {
      pending: { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock className="w-4 h-4" />, label: 'Pending' },
      reviewing: { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <Search className="w-4 h-4" />, label: 'Under Review' },
      interviewing: { color: 'bg-purple-50 text-purple-700 border-purple-100', icon: <Calendar className="w-4 h-4" />, label: 'Interviewing' },
      accepted: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Hired' },
      hired: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Hired' },
      rejected: { color: 'bg-rose-50 text-rose-700 border-rose-100', icon: <XCircle className="w-4 h-4" />, label: 'Not Selected' },
    };
    return statusMap[status.toLowerCase()] || { color: 'bg-gray-50 text-gray-700 border-gray-100', icon: <AlertCircle className="w-4 h-4" />, label: status };
  };

  if (loading) return <Loading />;

  const filteredApplications = applications.filter(app => {
    const jobData = typeof app.job === 'object' ? app.job : null;
    const searchLower = searchTerm.toLowerCase();
    return (
      (jobData?.title?.toLowerCase().includes(searchLower)) ||
      (jobData?.company?.name?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Applications</h1>
            <p className="text-gray-500 font-medium mt-1">Track and manage your job applications status</p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Briefcase className="w-5 h-5" />
            Find More Jobs
          </Link>
        </div>

        {/* Stats Summary - Derived from applications array */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Applied" value={totalApplied} color="blue" />
          <StatCard label="Interviewing" value={interviewingCount} color="purple" />
          <StatCard label="Offers" value={offersCount} color="emerald" />
          <StatCard label="Pending" value={pendingCount} color="amber" />
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job title or company..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Applications List */}
        <div className="grid gap-4">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app) => {
              const { color, icon, label } = getStatusDetails(app.status);
              const jobData = typeof app.job === 'object' ? app.job : null;
              const appKey = app.id || app._id || `app-${Math.random()}`;
              
              // Fix Invalid Date: Check if date field exists and use fallback
              const appliedDate = app.createdAt;
              const formattedDate = appliedDate 
                ? new Date(appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recently';

              return (
                <div key={appKey} className="group bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                    <div className="flex items-center gap-5">
                      {/* Company Logo Placeholder */}
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Building2 className="w-8 h-8" />
                      </div>

                      <div>
                        <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {jobData && typeof jobData.title === 'string' ? jobData.title : 'Position Title'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1 text-sm font-medium text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4" />
                            {typeof jobData?.company === 'object' && jobData?.company?.name ? jobData.company.name : 'Company Name'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            Applied {formattedDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      {app.interviewScore && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                          <Trophy className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-bold text-blue-700">Score: {app.interviewScore}%</span>
                        </div>
                      )}

                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm ${color}`}>
                        {icon}
                        {label}
                      </div>

                      <button className="p-3 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Briefcase className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No applications found</h2>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto font-medium">You haven't applied to any jobs yet. Start your journey today!</p>
              <Link to="/jobs" className="text-blue-600 font-black hover:underline underline-offset-8 decoration-2">
                Browse available jobs →
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Sub-component for Stats
const StatCard = ({ label, value, color }: { label: string, value: number, color: string }) => {
  const colors: any = {
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
      <span className={`text-2xl font-black mb-1 ${colors[color].split(' ')[0]}`}>{value}</span>
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  );
};

export default CandidateApplications;
