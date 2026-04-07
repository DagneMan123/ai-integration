import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Users, Briefcase, Video, DollarSign } from 'lucide-react';
import { DashboardStats, DashboardRole } from '../services/dashboardCommunicationService';

interface DashboardInfoPanelProps {
  stats: DashboardStats;
  role: DashboardRole;
  onClose: () => void;
  isOpen: boolean;
}

const DashboardInfoPanel: React.FC<DashboardInfoPanelProps> = ({ stats, role, onClose, isOpen }) => {
  const [displayStats, setDisplayStats] = useState(stats);

  useEffect(() => {
    setDisplayStats(stats);
  }, [stats]);

  if (!isOpen) return null;

  const getRelevantStats = () => {
    switch (role) {
      case 'admin':
        return [
          { label: 'Total Users', value: displayStats.totalUsers, icon: Users, color: 'bg-blue-100 text-blue-600' },
          { label: 'Active Jobs', value: displayStats.activeJobs, icon: Briefcase, color: 'bg-green-100 text-green-600' },
          { label: 'Pending Applications', value: displayStats.pendingApplications, icon: TrendingUp, color: 'bg-yellow-100 text-yellow-600' },
          { label: 'Completed Interviews', value: displayStats.completedInterviews, icon: Video, color: 'bg-purple-100 text-purple-600' },
          { label: 'Platform Revenue', value: displayStats.platformRevenue, icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' }
        ];
      case 'employer':
        return [
          { label: 'Active Jobs', value: displayStats.activeJobs, icon: Briefcase, color: 'bg-green-100 text-green-600' },
          { label: 'Pending Applications', value: displayStats.pendingApplications, icon: TrendingUp, color: 'bg-yellow-100 text-yellow-600' },
          { label: 'Total Candidates', value: displayStats.totalUsers, icon: Users, color: 'bg-blue-100 text-blue-600' },
          { label: 'Completed Interviews', value: displayStats.completedInterviews, icon: Video, color: 'bg-purple-100 text-purple-600' }
        ];
      case 'candidate':
        return [
          { label: 'Active Jobs', value: displayStats.activeJobs, icon: Briefcase, color: 'bg-green-100 text-green-600' },
          { label: 'Pending Applications', value: displayStats.pendingApplications, icon: TrendingUp, color: 'bg-yellow-100 text-yellow-600' },
          { label: 'Completed Interviews', value: displayStats.completedInterviews, icon: Video, color: 'bg-purple-100 text-purple-600' },
          { label: 'Platform Revenue', value: displayStats.platformRevenue, icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' }
        ];
      default:
        return [];
    }
  };

  const relevantStats = getRelevantStats();

  return (
    <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose}>
      <div
        className="fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Platform Statistics</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Shared Data</h3>
            <span className="text-xs text-slate-500">
              Updated: {displayStats.lastUpdated ? new Date(displayStats.lastUpdated).toLocaleTimeString() : 'N/A'}
            </span>
          </div>

          <div className="space-y-3">
            {relevantStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stat.color}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">
              💡 This data is shared across all dashboards in real-time. Changes made in any dashboard are reflected here immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardInfoPanel;
