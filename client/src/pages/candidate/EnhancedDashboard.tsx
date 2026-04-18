import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { ApplicationTracker } from '../../components/ApplicationTracker';
import { AIScoreVisualization } from '../../components/AIScoreVisualization';
import { ProfileStrengthIndicator } from '../../components/ProfileStrengthIndicator';
import { useAuthStore } from '../../store/authStore';
import { candidateMenu } from '../../config/menuConfig';

const EnhancedDashboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Career Dashboard</h1>
          <p className="text-gray-600">Track your applications, interview scores, and profile strength</p>
        </div>

        {/* Profile Strength */}
        <ProfileStrengthIndicator />

        {/* AI Scores */}
        <AIScoreVisualization />

        {/* Applications */}
        <ApplicationTracker />
      </div>
    </DashboardLayout>
  );
};

export default EnhancedDashboard;
