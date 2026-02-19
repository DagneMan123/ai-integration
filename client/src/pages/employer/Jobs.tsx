import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../utils/api';
import { Job } from '../../types';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import { FiEdit, FiTrash2, FiEye, FiUsers } from 'react-icons/fi';

const EmployerJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getEmployerJobs();
      setJobs(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      await jobAPI.deleteJob(id);
      toast.success('Job deleted successfully');
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete job');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      await jobAPI.updateJobStatus(id, newStatus);
      toast.success(`Job ${newStatus === 'active' ? 'activated' : 'closed'}`);
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
          <Link
            to="/employer/jobs/create"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition font-medium"
          >
            + Create New Job
          </Link>
        </div>

        <div className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map((job) => {
              const jobId = job.id || job._id;
              if (!jobId) return null;
              
              return (
              <div key={jobId} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          (job.status === 'ACTIVE' || job.status === 'active')
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {job.status}
                      </span>
                      {job.isApproved ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          Approved
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          Pending Approval
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{job.location || 'Not specified'} • {job.experienceLevel || 'Not specified'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiEye /> {job.views || 0} views
                      </span>
                      <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.isArray(job.skills) && job.skills.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Link
                    to={`/employer/jobs/${jobId}/candidates`}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    <FiUsers /> View Candidates
                  </Link>
                  <Link
                    to={`/employer/jobs/${jobId}/edit`}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
                  >
                    <FiEdit /> Edit
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(String(jobId), job.status)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition text-sm"
                  >
                    {job.status === 'ACTIVE' || job.status === 'active' ? 'Close' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(String(jobId))}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 text-lg mb-4">No jobs posted yet</p>
              <Link
                to="/employer/jobs/create"
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
              >
                Create Your First Job
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerJobs;
