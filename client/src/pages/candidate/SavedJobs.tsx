import React, { useEffect, useState } from 'react';
import { Bookmark, Search, MapPin, Building2, Calendar, Trash2, ExternalLink, Filter } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import Loading from '../../components/Loading';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

interface SavedJob {
  id: number;
  job: {
    id: number;
    title: string;
    location: string;
    company: {
      name: string;
    };
  };
  savedAt: string;
}

type SortOption = 'recent' | 'oldest' | 'title-asc' | 'title-desc';

const SavedJobs: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<SavedJob[]>('/saved-jobs');
      setSavedJobs(data || []);
    } catch (error) {
      toast.error('Failed to load saved jobs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSavedJob = async (jobId: number) => {
    try {
      await apiService.delete(`/saved-jobs/${jobId}`);
      setSavedJobs(savedJobs.filter(sj => sj.job.id !== jobId));
      toast.success('Job removed from saved');
      setShowDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to remove saved job');
      console.error(error);
    }
  };

  const getSortedJobs = (jobs: SavedJob[]) => {
    const sorted = [...jobs];
    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime());
      case 'title-asc':
        return sorted.sort((a, b) => a.job.title.localeCompare(b.job.title));
      case 'title-desc':
        return sorted.sort((a, b) => b.job.title.localeCompare(a.job.title));
      default:
        return sorted;
    }
  };

  const filteredJobs = savedJobs.filter(sj =>
    sj.job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sj.job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sj.job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedJobs = getSortedJobs(filteredJobs);
  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <Loading />;

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="space-y-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Saved Jobs</h1>
                <p className="text-gray-600 mt-2">Manage your bookmarked job opportunities</p>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Bookmark className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-semibold text-blue-600">{savedJobs.length}</span>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by job title, company, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Jobs List */}
          {sortedJobs.length > 0 ? (
            <div className="space-y-4">
              {sortedJobs.map((sj) => (
                <div
                  key={sj.id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition mb-3">
                          {sj.job.title}
                        </h3>

                        <div className="space-y-2">
                          {/* Company */}
                          <div className="flex items-center gap-2 text-gray-700">
                            <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="font-medium">{sj.job.company?.name}</span>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span>{sj.job.location}</span>
                          </div>

                          {/* Saved Date */}
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>Saved {formatDate(sj.savedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 md:flex-col md:gap-3">
                        <button
                          onClick={() => window.open(`/jobs/${sj.job.id}`, '_blank')}
                          className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </button>

                        {showDeleteConfirm === sj.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRemoveSavedJob(sj.job.id)}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowDeleteConfirm(sj.id)}
                            className="flex-1 md:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition flex items-center justify-center gap-2 font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No saved jobs yet</h3>
              <p className="text-gray-600 mb-6">Start bookmarking jobs to save them for later</p>
              <a
                href="/jobs"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Browse Jobs
              </a>
            </div>
          )}

          {/* Results Count */}
          {sortedJobs.length > 0 && (
            <div className="mt-8 text-center text-gray-600">
              <p>Showing {sortedJobs.length} of {savedJobs.length} saved jobs</p>
            </div>
          )}
      </div>
    </DashboardLayout>
  );
};

export default SavedJobs;
