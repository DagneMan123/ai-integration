import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../utils/api';
import { Job } from '../types';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Filter, 
  ChevronRight, 
  ShieldCheck, 
  Zap,
  Clock
} from 'lucide-react';

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getAllJobs({ search, category });
      const rawData = response.data?.data || response.data;
      const jobsArray = Array.isArray(rawData) ? rawData : [];

      const normalizedJobs = jobsArray
        .filter((job: any) => job && (job._id || job.id))
        .map((job: any) => ({
          ...job,
          id: job._id || job.id,
          skills: Array.isArray(job.skills) ? job.skills : job.requiredSkills || [],
          location: job.location || 'Remote',
          experienceLevel: job.experienceLevel || 'Entry Level',
          company: job.companyId || job.company || { name: 'SimuAI Partner', isVerified: false }
        }));

      setJobs(normalizedJobs);
    } catch (error) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    // Debounce logic: ተጠቃሚው ጽፎ ከጨረሰ ከ 500ms በኋላ fetch ያደርጋል
    const delayDebounceFn = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category, fetchJobs]);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Explore Opportunities</h1>
          <p className="text-gray-500 font-medium text-lg">Find your dream role and ace it with AI-powered interviews.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100 mb-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium text-gray-700"
              />
            </div>

            <div className="relative md:w-64">
              <Filter className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none appearance-none font-bold text-gray-600 cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="technology">Technology</option>
                <option value="marketing">Marketing</option>
                <option value="design">Creative & Design</option>
                <option value="finance">Finance & Accounting</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs Feed */}
        <div className="grid gap-6">
          {loading ? (
            // Skeleton Loader
            [1, 2, 3].map((i) => <div key={i} className="h-40 bg-white rounded-[2rem] animate-pulse border border-gray-100" />)
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="group block bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100">
                        {job.jobType || 'Full-time'}
                      </span>
                      {job.company?.isVerified && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      {job.title}
                    </h3>
                    <p className="text-gray-500 font-bold flex items-center gap-2 mb-6">
                      {job.company?.name}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-300" /> {job.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-300" /> {job.experienceLevel}
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600/80">
                        <DollarSign className="w-4 h-4" /> 
                        {job.salary?.min ? `${(job.salary.min/1000)}k - ${(job.salary.max/1000)}k ${job.salary.currency}` : 'Competitive Salary'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <div className="hidden md:flex flex-wrap justify-end gap-2 max-w-[300px]">
                      {job.skills?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-50 text-gray-400 text-[11px] font-bold rounded-lg border border-gray-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-blue-100 group-hover:bg-blue-700 transition-all active:scale-95">
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                
                {/* Meta: Posted Time */}
                <div className="mt-6 pt-6 border-t border-gray-50 flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  Posted {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <Zap className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No matching jobs</h2>
              <p className="text-gray-500 font-medium">Try broadening your search or changing categories.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;