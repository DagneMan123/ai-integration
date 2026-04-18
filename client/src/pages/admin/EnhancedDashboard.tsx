import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { SystemHealth } from '../../components/SystemHealth';
import { APIUsageAnalytics } from '../../components/APIUsageAnalytics';
import { UserGrowthChart } from '../../components/UserGrowthChart';
import { ErrorTracking } from '../../components/ErrorTracking';
import { useAuthStore } from '../../store/authStore';
import { adminMenu } from '../../config/menuConfig';

const EnhancedDashboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <DashboardLayout menuItems={adminMenu} role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">System Health & Analytics</h1>
          <p className="text-gray-600">Monitor platform performance, user growth, and system health</p>
        </div>

        {/* System Health */}
        <SystemHealth />

        {/* API Usage & User Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <APIUsageAnalytics />
          <UserGrowthChart />
        </div>

        {/* Error Tracking */}
        <ErrorTracking />
      </div>
    </DashboardLayout>
  );
};

export default EnhancedDashboard;
