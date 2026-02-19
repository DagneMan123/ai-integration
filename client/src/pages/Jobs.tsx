import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../utils/api';
import { Job } from '../types';
import Loading from '../components/Loading';
import { FiMapPin, FiBriefcase, FiDollarSign, FiSearch } from 'react-icons/fi';

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [search, category]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getAllJobs({ search, category });
      
      // 1. Extract the raw data from response
      const rawData = response.data?.data || response.data;

      // 2. Ensure the data is actually an array before calling .filter()
      const jobsArray = Array.isArray(rawData) ? rawData : [];

      const normalizedJobs = jobsArray
        .filter((job: any) => job && (job._id || job.id)) // Only keep items with IDs
        .map((job: any) => {
          const id = job._id || job.id;
          return {
            ...job,
            id: id,
            _id: id,
            skills: Array.isArray(job.skills) ? job.skills : [],
            location: job.location || 'Not specified',
            experienceLevel: job.experienceLevel || 'Not specified',
            companyId: job.companyId || job.company || { name: 'Company', isVerified: false }
          };
        });

      setJobs(normalizedJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setJobs([]); // Reset to empty array on error to avoid crashes
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
          <p className="text-gray-600">Find your next opportunity</p>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="">All Categories</option>
              <option value="technology">Technology</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
              <option value="design">Design</option>
              <option value="finance">Finance</option>
            </select>

            <button
              onClick={fetchJobs}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Search
            </button>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map((job) => {
              const jobId = job.id || job._id;
              
              if (!jobId) return null;
              
              return (
                <Link
                  key={jobId}
                  to={`/jobs/${jobId}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border border-gray-200"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-gray-600 text-sm">
                        {typeof job.companyId === 'object' ? job.companyId?.name : 'Company'}
                      </p>
                    </div>
                    {typeof job.companyId === 'object' && job.companyId?.isVerified && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <FiMapPin className="text-gray-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiBriefcase className="text-gray-400" />
                      <span>{job.experienceLevel}</span>
                    </div>
                    {(job.salary?.min || job.salaryMin) && (
                      <div className="flex items-center gap-1">
                        <FiDollarSign className="text-gray-400" />
                        <span>
                          ${(job.salary?.min || job.salaryMin)?.toLocaleString()} - ${(job.salary?.max || job.salaryMax)?.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {Array.isArray(job.skills) && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.skills.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="inline-block text-gray-500 text-xs px-3 py-1">
                          +{job.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg mb-2">No jobs found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;