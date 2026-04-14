import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Search, Filter, X } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminMenu } from '../../config/menuConfig';
import api from '../../utils/api';
import Loading from '../../components/Loading';

interface Job {
  id: number;
  title: string;
  company: string;
  date: string;
  status: string;
  description?: string;
  salary?: string;
  location?: string;
  jobType?: string;
  requirements?: string;
  createdBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/jobs');
      
      // Safely extract data
      let data: any[] = [];
      if (response.data?.data) {
        data = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (Array.isArray(response.data)) {
        data = response.data;
      }
      
      const formattedJobs = data
        .filter((job: any) => job && typeof job === 'object')
        .map((job: any) => ({
          id: job.id || job._id || Math.random(),
          title: String(job.title || ''),
          company: typeof job.company === 'object' ? String(job.company?.name || 'Unknown') : String(job.company || 'Unknown'),
          date: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A',
          status: String(job.status || 'DRAFT'),
          description: job.description || '',
          salary: job.salary || '',
          location: job.location || '',
          jobType: job.jobType || '',
          requirements: job.requirements || '',
          createdBy: job.createdBy
        }));
      
      setJobs(formattedJobs);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load jobs';
      setError(errorMessage);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApproveJob = async (jobId: number) => {
    try {
      setActionLoading(jobId);
      await api.patch(`/admin/jobs/${jobId}/approve`);
      addToast('Job approved successfully', 'success');
      setSelectedJob(null);
      setShowModal(false);
      await fetchJobs();
    } catch (err: any) {
      console.error('Error approving job:', err);
      addToast(err.response?.data?.message || 'Failed to approve job', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectJob = async (jobId: number) => {
    try {
      setActionLoading(jobId);
      await api.patch(`/admin/jobs/${jobId}/reject`, { reason: rejectReason });
      addToast('Job rejected successfully', 'success');
      setSelectedJob(null);
      setShowModal(false);
      setRejectReason('');
      setShowRejectForm(false);
      await fetchJobs();
    } catch (err: any) {
      console.error('Error rejecting job:', err);
      addToast(err.response?.data?.message || 'Failed to reject job', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setShowModal(true);
    setShowRejectForm(false);
    setRejectReason('');
  };

  const getFilteredJobs = () => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  return (
    <DashboardLayout menuItems={adminMenu} role="admin">
      <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Moderation</h1>
            <p className="text-gray-500 text-sm">Review and manage job postings</p>
          </div>
          <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search jobs..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
             </div>
             <div className="relative">
               <button 
                 onClick={() => setShowFilterMenu(!showFilterMenu)}
                 className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white text-sm hover:bg-gray-50 transition-colors"
               >
                 <Filter className="h-4 w-4" /> 
                 Filter {statusFilter !== 'all' && `(${statusFilter})`}
               </button>
               {showFilterMenu && (
                 <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                   <button
                     onClick={() => {
                       setStatusFilter('all');
                       setShowFilterMenu(false);
                     }}
                     className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${statusFilter === 'all' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                   >
                     All Jobs
                   </button>
                   <button
                     onClick={() => {
                       setStatusFilter('DRAFT');
                       setShowFilterMenu(false);
                     }}
                     className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${statusFilter === 'DRAFT' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                   >
                     Pending Approval
                   </button>
                   <button
                     onClick={() => {
                       setStatusFilter('ACTIVE');
                       setShowFilterMenu(false);
                     }}
                     className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${statusFilter === 'ACTIVE' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                   >
                     Approved
                   </button>
                   <button
                     onClick={() => {
                       setStatusFilter('CLOSED');
                       setShowFilterMenu(false);
                     }}
                     className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${statusFilter === 'CLOSED' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                   >
                     Closed/Rejected
                   </button>
                 </div>
               )}
             </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            <p className="font-semibold">Error: {error}</p>
            <p className="text-sm mt-2">Please ensure you are logged in as an admin user.</p>
          </div>
        )}

        {loading && <Loading />}

        {!loading && !error && (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-400">
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'DRAFT').length}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                <p className="text-sm text-gray-500">Total Approved</p>
                <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'ACTIVE').length}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
                <p className="text-sm text-gray-500">Closed</p>
                <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'CLOSED').length}</p>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Job Title</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Company</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date Posted</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {getFilteredJobs().length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No jobs found
                      </td>
                    </tr>
                  ) : (
                    getFilteredJobs().map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                        <td className="px-6 py-4 text-gray-600">{job.company}</td>
                        <td className="px-6 py-4 text-gray-500">{job.date}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium 
                            ${job.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                              job.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-red-100 text-red-700'}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleViewDetails(job)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {job.status === 'DRAFT' && (
                              <>
                                <button 
                                  onClick={() => handleApproveJob(job.id)}
                                  disabled={actionLoading === job.id}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50" 
                                  title="Approve"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setShowModal(true);
                                    setShowRejectForm(true);
                                  }}
                                  disabled={actionLoading === job.id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" 
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white animate-fade-in ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Job Details Modal */}
      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                <p className="text-gray-500 text-sm mt-1">{selectedJob.company}</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setShowRejectForm(false);
                  setRejectReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${selectedJob.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                    selectedJob.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'}`}>
                  {selectedJob.status}
                </span>
              </div>

              {/* Job Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{selectedJob.location || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Job Type</p>
                  <p className="font-medium text-gray-900">{selectedJob.jobType || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Salary</p>
                  <p className="font-medium text-gray-900">{selectedJob.salary || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Posted Date</p>
                  <p className="font-medium text-gray-900">{selectedJob.date}</p>
                </div>
              </div>

              {/* Posted By */}
              {selectedJob.createdBy && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Posted By</p>
                  <p className="font-medium text-gray-900">
                    {selectedJob.createdBy.firstName} {selectedJob.createdBy.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{selectedJob.createdBy.email}</p>
                </div>
              )}

              {/* Description */}
              {selectedJob.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.description}</p>
                </div>
              )}

              {/* Requirements */}
              {selectedJob.requirements && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Requirements</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.requirements}</p>
                </div>
              )}

              {/* Reject Form */}
              {showRejectForm && selectedJob.status === 'DRAFT' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Rejection Reason (Optional)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why this job posting is being rejected..."
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedJob.status === 'DRAFT' && (
              <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setShowRejectForm(false);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                {!showRejectForm ? (
                  <>
                    <button
                      onClick={() => handleApproveJob(selectedJob.id)}
                      disabled={actionLoading === selectedJob.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      disabled={actionLoading === selectedJob.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowRejectForm(false)}
                      className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => handleRejectJob(selectedJob.id)}
                      disabled={actionLoading === selectedJob.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Confirm Rejection
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default AdminJobs;
