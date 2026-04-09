import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Search, Filter } from 'lucide-react';
import api from '../../utils/api';
import Loading from '../../components/Loading';

interface Job {
  id: number;
  title: string;
  company: string;
  date: string;
  status: string;
}

const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
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
            status: String(job.status || 'DRAFT')
          }));
        
        setJobs(formattedJobs);
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
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
             <button className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white text-sm hover:bg-gray-50">
               <Filter className="h-4 w-4" /> Filter
             </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            {error}
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
                  {jobs.filter(job =>
                    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.company.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No jobs found
                      </td>
                    </tr>
                  ) : (
                    jobs.filter(job =>
                      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      job.company.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((job) => (
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
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View Details">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Reject">
                              <XCircle className="h-4 w-4" />
                            </button>
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
    </div>
  );
};

export default AdminJobs;
