import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../utils/api';
import { Job } from '../types';
import { useAuthStore } from '../store/authStore';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import { FiMapPin, FiBriefcase, FiDollarSign, FiClock } from 'react-icons/fi';

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await jobAPI.getJob(id!);
      setJob(response.data.data || null);
    } catch (error) {
      console.error('Failed to fetch job', error);
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'candidate') {
      toast.error('Only candidates can apply for jobs');
      return;
    }

    setApplying(true);
    try {
      await applicationAPI.createApplication({ jobId: id });
      toast.success('Application submitted successfully!');
      navigate('/candidate/applications');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Loading />;
  if (!job) return <div className="text-center py-12">Job not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-xl text-gray-600">{job.companyId?.name}</p>
            </div>
            {job.companyId?.isVerified && (
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
                ✓ Verified Company
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <FiMapPin className="text-primary" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiBriefcase className="text-primary" />
              <span>{job.experienceLevel}</span>
            </div>
            {job.salary && (
              <div className="flex items-center gap-2 text-gray-600">
                <FiDollarSign className="text-primary" />
                <span>
                  {job.salary.min} - {job.salary.max} {job.salary.currency}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <FiClock className="text-primary" />
              <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-primary-light text-primary px-4 py-2 rounded-lg font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Job Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>

          {user?.role === 'candidate' && (
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 text-lg"
            >
              {applying ? 'Applying...' : 'Apply Now'}
            </button>
          )}

          {!user && (
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary-dark transition text-lg"
            >
              Login to Apply
            </button>
          )}
        </div>

        {job.companyId && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Company</h2>
            <div className="flex items-start gap-4">
              {job.companyId.logo && (
                <img
                  src={job.companyId.logo}
                  alt={job.companyId.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {job.companyId.name}
                </h3>
                <p className="text-gray-600 mb-2">{job.companyId.industry}</p>
                {job.companyId.description && (
                  <p className="text-gray-700">{job.companyId.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
