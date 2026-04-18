import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, UserPlus } from 'lucide-react';
import { apiService } from '../services/apiService';

interface GrowthMetric {
  date: string;
  totalUsers: number;
  newUsers: number;
  candidates: number;
  employers: number;
}

interface UserGrowthData {
  totalUsers: number;
  newUsersThisMonth: number;
  growthRate: number;
  metrics: GrowthMetric[];
}

export const UserGrowthChart: React.FC = () => {
  const [growthData, setGrowthData] = useState<UserGrowthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserGrowth();
  }, []);

  const fetchUserGrowth = async () => {
    try {
      const response = await apiService.get('/dashboard-enhanced/admin');
      if ((response as any)?.data?.userGrowth) {
        setGrowthData((response as any).data.userGrowth);
      }
    } catch (err) {
      console.error('Failed to load user growth:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!growthData) {
    return <div className="text-center text-gray-500">No growth data available</div>;
  }

  const maxUsers = Math.max(...growthData.metrics.map(m => m.totalUsers), 1);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-green-600" />
        User Growth
      </h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total Users */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Total Users</p>
          <p className="text-3xl font-bold text-blue-600">{growthData.totalUsers.toLocaleString()}</p>
          <p className="text-xs text-gray-600 mt-2">All time</p>
        </div>

        {/* New Users This Month */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-gray-600 mb-2">New Users This Month</p>
          <p className="text-3xl font-bold text-green-600">{growthData.newUsersThisMonth}</p>
          <p className="text-xs text-gray-600 mt-2">Current month</p>
        </div>

        {/* Growth Rate */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-gray-600 mb-2">Growth Rate</p>
          <p className="text-3xl font-bold text-purple-600">{growthData.growthRate}%</p>
          <p className="text-xs text-gray-600 mt-2">Month over month</p>
        </div>
      </div>

      {/* Growth Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          User Growth Trend
        </h3>
        <div className="space-y-3">
          {growthData.metrics.map((metric, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-24 text-sm font-semibold text-gray-700">
                {new Date(metric.date).toLocaleDateString()}
              </div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-300"
                    style={{ width: `${(metric.totalUsers / maxUsers) * 100}%` }}
                  >
                    {metric.totalUsers > 0 && (
                      <span className="text-xs font-bold text-white">
                        {metric.totalUsers}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-32 text-right">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-green-600">+{metric.newUsers}</span> new
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Breakdown */}
      {growthData.metrics.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Latest User Breakdown
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Candidates</p>
              <p className="text-2xl font-bold text-blue-600">
                {growthData.metrics[growthData.metrics.length - 1].candidates}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Employers</p>
              <p className="text-2xl font-bold text-green-600">
                {growthData.metrics[growthData.metrics.length - 1].employers}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
