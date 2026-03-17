import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, Search, Filter } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  date: string;
  status: string;
}

const MOCK_JOBS: Job[] = [
  {
    id: 1,
    title: 'Senior React Developer',
    company: 'TechCorp Solutions',
    date: '2024-03-15',
    status: 'Pending'
  },
  {
    id: 2,
    title: 'Full Stack Engineer',
    company: 'Global Finance Inc',
    date: '2024-03-12',
    status: 'Approved'
  },
  {
    id: 3,
    title: 'DevOps Specialist',
    company: 'Healthcare Plus',
    date: '2024-03-18',
    status: 'Pending'
  },
  {
    id: 4,
    title: 'Data Scientist',
    company: 'Retail Masters',
    date: '2024-03-05',
    status: 'Rejected'
  },
  {
    id: 5,
    title: 'Product Manager',
    company: 'Education First',
    date: '2024-03-10',
    status: 'Approved'
  }
];

const AdminJobs: React.FC = () => {
  const [jobs] = useState<Job[]>(MOCK_JOBS);

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
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
             </div>
             <button className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white text-sm hover:bg-gray-50">
               <Filter className="h-4 w-4" /> Filter
             </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-400">
            <p className="text-sm text-gray-500">Pending Approval</p>
            <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'Pending').length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Total Approved</p>
            <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'Approved').length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'Rejected').length}</p>
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
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No jobs found
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                    <td className="px-6 py-4 text-gray-600">{job.company}</td>
                    <td className="px-6 py-4 text-gray-500">{job.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${job.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                          job.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
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
      </div>
    </div>
  );
};

export default AdminJobs;
