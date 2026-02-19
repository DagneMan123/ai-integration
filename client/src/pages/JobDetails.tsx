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
    // Block both null and the literal string "undefined"
    if (id && id !== 'undefined') {
      fetchJob();
    } else {
      setLoading(false);
      setJob(null);
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getJob(id!);
      
      // Extract job data from response
      const jobData = response.data?.data;
      if (jobData && typeof jobData === 'object' && 'title' in jobData) {
        setJob(jobData as Job);
      } else {
        setJob(null);
      }
    } catch (error) {
      console.error('Failed to fetch job', error);
      toast.error('Could not load job details');
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

    if (!id || id === 'undefined') {
      toast.error('Invalid Job ID');
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
  
  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-600">Job not found</h2>
        <button 
          onClick={() => navigate('/jobs')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-xl text-gray-600">
                {typeof job.companyId === 'object' ? job.companyId?.name : 'Company'}
              </p>
            </div>
            {typeof job.companyId === 'object' && job.companyId?.isVerified && (
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
                ✓ Verified Company
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <FiMapPin className="text-blue-600" />
              <span>{job.location || 'Remote'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiBriefcase className="text-blue-600" />
              <span>{job.experienceLevel}</span>
            </div>
            {job.salary && (
              <div className="flex items-center gap-2 text-gray-600">
                <FiDollarSign className="text-blue-600" />
                <span>
                  {job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()} {job.salary.currency || 'USD'}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <FiClock className="text-blue-600" />
              <span>Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(job.requiredSkills || job.skills) && (job.requiredSkills || job.skills)?.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium border border-blue-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Job Description</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {job.description}
            </p>
          </div>

          {user?.role === 'candidate' ? (
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-lg shadow-lg"
            >
              {applying ? 'Applying...' : 'Apply Now'}
            </button>
          ) : !user ? (
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-800 text-white py-4 rounded-lg font-semibold hover:bg-gray-900 transition text-lg"
            >
              Login to Apply
            </button>
          ) : null}
        </div>

        {typeof job.companyId === 'object' && job.companyId && (
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Company</h2>
            <div className="flex items-start gap-4">
              {job.companyId.logo && (
                <img
                  src={job.companyId.logo}
                  alt={job.companyId.name}
                  className="w-16 h-16 rounded-lg object-cover border"
                />
              )}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {job.companyId.name}
                </h3>
                <p className="text-blue-600 text-sm font-medium mb-2">{job.companyId.industry}</p>
                {job.companyId.description && (
                  <p className="text-gray-600 leading-relaxed">{job.companyId.description}</p>
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