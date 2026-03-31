import React, { useEffect, useState } from 'react';
import { Bookmark, Search } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import Loading from '../../components/Loading';

const SavedJobs: React.FC = () => {
  const [savedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch saved jobs
    setLoading(false);
  }, []);

  const filteredJobs = savedJobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Saved Jobs</h1>
              <p className="text-gray-500 font-medium mt-1">Your bookmarked job opportunities</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search saved jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Jobs List */}
          {filteredJobs.length > 0 ? (
            <div className="grid gap-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                      <p className="text-gray-600 font-medium">{job.company}</p>
                      <p className="text-sm text-gray-500 mt-2">{job.location}</p>
                    </div>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Bookmark className="w-6 h-6 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-gray-500 font-bold text-lg">No saved jobs yet</p>
              <p className="text-gray-400">Start bookmarking jobs to save them for later</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SavedJobs;
