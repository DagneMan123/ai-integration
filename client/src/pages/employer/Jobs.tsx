import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../utils/api';
import { Job } from '../../types';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Eye, 
  Users, 
  Edit3, 
  Trash2, 
  Power, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ShieldAlert,
  ChevronRight,
  Briefcase
} from 'lucide-react';

const EmployerJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      const response = await jobAPI.getEmployerJobs();
      setJobs(response.data.data || []);
    } catch (error) {
      toast.error('Failed to sync job listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently remove this job?')) return;
    try {
      await jobAPI.deleteJob(id);
      toast.success('Job removed successfully');
      fetchJobs();
    } catch (error: any) {
      toast.error('Deletion failed');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus.toLowerCase() === 'active' ? 'closed' : 'active';
    try {
      await jobAPI.updateJobStatus(id, newStatus);
      toast.success(`Job marked as ${newStatus}`);
      fetchJobs();
    } catch (error: any) {
      toast.error('Status update failed');
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Job Management</h1>
            <p className="text-gray-500 font-medium mt-1">
              You have <span className="text-blue-600 font-bold">{jobs.filter(j => j.status?.toLowerCase() === 'active').length} active</span> postings.
            </p>
          </div>
          <Link
            to="/employer/jobs/create"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Post New Job
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>

        {/* Job Listings */}
        <div className="grid gap-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const jobId = String(job.id || job._id);
              const isActive = job.status?.toLowerCase() === 'active';

              return (
                <div key={jobId} className="group bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 overflow-hidden relative">
                  
                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 w-2 h-full ${isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    
                    {/* Job Info Section */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                          {job.status}
                        </span>
                        
                        {job.isApproved ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck className="w-3 h-3" /> Approved
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <ShieldAlert className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm font-semibold text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-300" /> {job.location || 'Remote'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-gray-300" /> Posted {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5 text-blue-600/70">
                            <Eye className="w-4 h-4" /> {job.views || 0} views
                          </span>
                        </div>
                      </div>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(job.requiredSkills || job.skills)?.slice(0, 3).map((skill: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-gray-50 text-gray-500 text-[11px] font-bold rounded-lg border border-gray-100">
                            {skill}
                          </span>
                        ))}
                        {(job.requiredSkills || job.skills)?.length > 3 && (
                          <span className="text-[11px] font-bold text-gray-400 self-center">+{(job.requiredSkills || job.skills)!.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    {/* Actions Grid */}
                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
                      <Link
                        to={`/employer/jobs/${jobId}/candidates`}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-md group/btn"
                      >
                        <Users className="w-4 h-4" />
                        Candidates
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/employer/jobs/${jobId}/edit`}
                          className="p-3 bg-white border border-gray-100 text-gray-500 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                          title="Edit Listing"
                        >
                          <Edit3 className="w-5 h-5" />
                        </Link>
                        
                        <button
                          onClick={() => handleToggleStatus(jobId, job.status)}
                          className={`p-3 rounded-xl transition-all shadow-sm border ${
                            isActive 
                            ? 'bg-white border-gray-100 text-gray-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100' 
                            : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                          }`}
                          title={isActive ? "Close Job" : "Activate Job"}
                        >
                          <Power className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleDelete(jobId)}
                          className="p-3 bg-white border border-gray-100 text-gray-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Briefcase className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No jobs posted</h2>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto font-medium">Create your first job posting to start finding talent with AI-powered interviews.</p>
              <Link
                to="/employer/jobs/create"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
              >
                <Plus className="w-5 h-5" />
                Post Your First Job
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerJobs;