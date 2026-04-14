import React, { useEffect, useState } from 'react';
import { Bell, Plus, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import Loading from '../../components/Loading';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

interface JobAlert {
  id: number;
  keyword: string;
  location: string | null;
  experienceLevel: string | null;
  jobType: string | null;
  isActive: boolean;
  lastTriggered: string | null;
  createdAt: string;
}

const JobAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    keyword: '',
    location: '',
    experienceLevel: '',
    jobType: '',
  });

  useEffect(() => {
    fetchJobAlerts();
  }, []);

  const fetchJobAlerts = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<JobAlert[]>('/job-alerts');
      setAlerts(data || []);
    } catch (error) {
      toast.error('Failed to load job alerts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newAlert = await apiService.post<JobAlert>('/job-alerts', {
        keyword: formData.keyword,
        location: formData.location || null,
        experienceLevel: formData.experienceLevel || null,
        jobType: formData.jobType || null,
      });
      setAlerts([newAlert, ...alerts]);
      setFormData({ keyword: '', location: '', experienceLevel: '', jobType: '' });
      setShowForm(false);
      toast.success('Job alert created successfully');
    } catch (error) {
      toast.error('Failed to create job alert');
      console.error(error);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      await apiService.delete(`/job-alerts/${id}`);
      setAlerts(alerts.filter(alert => alert.id !== id));
      toast.success('Job alert deleted');
    } catch (error) {
      toast.error('Failed to delete job alert');
      console.error(error);
    }
  };

  if (loading) return <Loading />;

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Job Alerts</h1>
              <p className="text-gray-500 font-medium mt-1">Manage your job search notifications</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Alert
            </button>
          </div>

          {/* Create Alert Form */}
          {showForm && (
            <form onSubmit={handleCreateAlert} className="p-6 bg-blue-50 border border-blue-200 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Keyword *</label>
                  <input
                    type="text"
                    required
                    value={formData.keyword}
                    onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                    placeholder="e.g., React Developer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Addis Ababa"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Experience Level</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Job Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
                >
                  Create Alert
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Alerts List */}
          {alerts.length > 0 ? (
            <div className="grid gap-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Bell className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">{alert.keyword}</h3>
                        {!alert.isActive && <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Inactive</span>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2">
                        {alert.location && <span>📍 {alert.location}</span>}
                        {alert.experienceLevel && <span>💼 {alert.experienceLevel}</span>}
                        {alert.jobType && <span>🏢 {alert.jobType}</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Created: {new Date(alert.createdAt).toLocaleDateString()}
                        {alert.lastTriggered && ` • Last triggered: ${new Date(alert.lastTriggered).toLocaleDateString()}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-gray-500 font-bold text-lg">No job alerts yet</p>
              <p className="text-gray-400">Create alerts to get notified about new job opportunities</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobAlerts;
