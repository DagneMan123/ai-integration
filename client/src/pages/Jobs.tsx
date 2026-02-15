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
      const response = await jobAPI.getAllJobs({ search, category });
      setJobs(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Browse Jobs</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition font-medium"
            >
              Search
            </button>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-gray-600">{job.companyId?.name || 'Company'}</p>
                  </div>
                  {job.companyId?.isVerified && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                      Verified
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <FiMapPin />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiBriefcase />
                    <span>{job.experienceLevel}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-1">
                      <FiDollarSign />
                      <span>
                        {job.salary.min} - {job.salary.max} {job.salary.currency}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.skills.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 5 && (
                    <span className="text-gray-500 text-xs px-3 py-1">
                      +{job.skills.length - 5} more
                    </span>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No jobs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
