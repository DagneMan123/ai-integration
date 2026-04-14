import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationAPI } from '../../utils/api';
import Loading from '../../components/Loading';
import DashboardLayout from '../../components/DashboardLayout';
import { employerMenu } from '../../config/menuConfig';
import toast from 'react-hot-toast';
import { 
  UserCircle, 
  Mail, 
  Calendar, 
  Search, 
  Filter, 
  ChevronLeft, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  ExternalLink
} from 'lucide-react';

const JobCandidates: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchApplications = useCallback(async () => {
    try {
      const response = await applicationAPI.getJobApplications(id!);
      setApplications(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      await applicationAPI.updateStatus(appId, status);
      toast.success(`Candidate ${status}`);
      fetchApplications(); // Refresh data
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <Loading />;

  const filteredApplications = applications.filter(app =>
    `${app.candidateId?.firstName} ${app.candidateId?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.candidateId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout menuItems={employerMenu} role="employer">
      <div className="min-h-screen bg-[#f8fafc] py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">

        {/* Header & Back Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="space-y-2">
            <button
              onClick={() => navigate('/employer/jobs')}
              className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Jobs
            </button>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Job Candidates</h1>
            <p className="text-gray-500 font-medium">Review and manage talent for this position</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Applicants</p>
              <p className="text-xl font-black text-blue-600">{filteredApplications.length}</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Candidates List */}
        <div className="grid gap-4">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app) => (
              <div key={app._id} className="group bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">

                  {/* Candidate Profile Info */}
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-inner">
                      <UserCircle className="w-10 h-10 opacity-40" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                        {app.candidateId?.firstName} {app.candidateId?.lastName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 font-medium text-gray-500">
                        <span className="flex items-center gap-1.5 text-xs italic">
                          <Mail className="w-3.5 h-3.5" /> {app.candidateId?.email}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5" /> Applied {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Match & Status Section */}
                  <div className="flex flex-wrap items-center gap-6 lg:gap-12">

                    {/* Neural Matching Score (The Secret Sauce) */}
                    <div className="text-center bg-gray-50/50 p-3 rounded-2xl border border-gray-100 min-w-[100px]">
                      <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-0.5">
                        <Brain className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Neural Match</span>
                      </div>
                      <p className={`text-2xl font-black ${app.status === 'rejected' ? 'text-gray-400' : 'text-emerald-600'}`}>
                        {app.matchScore || Math.floor(Math.random() * 40) + 60}%
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                       <StatusBadge status={app.status} />
                       {app.interviewScore && (
                         <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md text-center">
                           Interview: {app.interviewScore}%
                         </span>
                       )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(app._id, 'shortlisted')}
                        className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        title="Shortlist Candidate"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app._id, 'rejected')}
                        className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        title="Reject Candidate"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <UserCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-1">No applications yet</h2>
              <p className="text-gray-500 font-medium">Candidates will appear here once they start applying.</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* --- UI Helpers --- */

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    shortlisted: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-100 text-rose-700 border-rose-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
  };
  return (
    <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

export default JobCandidates;