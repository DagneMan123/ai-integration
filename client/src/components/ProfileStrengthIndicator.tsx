import React, { useState, useEffect } from 'react';
import { User, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { apiService } from '../services/apiService';

interface ProfileStrength {
  score: number;
  level: string;
  completedFields: number;
  totalFields: number;
  recommendations: string[];
}

export const ProfileStrengthIndicator: React.FC = () => {
  const [profileStrength, setProfileStrength] = useState<ProfileStrength | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileStrength();
  }, []);

  const fetchProfileStrength = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/dashboard-enhanced/candidate');
      if ((response as any)?.data?.profileStrength) {
        setProfileStrength((response as any).data.profileStrength);
      }
    } catch (err) {
      console.error('Failed to load profile strength:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'EXCELLENT':
        return 'text-green-600';
      case 'GOOD':
        return 'text-blue-600';
      case 'FAIR':
        return 'text-yellow-600';
      case 'POOR':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getLevelBgColor = (level: string) => {
    switch (level) {
      case 'EXCELLENT':
        return 'bg-green-50 border-green-200';
      case 'GOOD':
        return 'bg-blue-50 border-blue-200';
      case 'FAIR':
        return 'bg-yellow-50 border-yellow-200';
      case 'POOR':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profileStrength) {
    return <div className="text-center text-gray-500">No profile data available</div>;
  }

  return (
    <div className={`rounded-lg shadow-md p-6 border ${getLevelBgColor(profileStrength.level)}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Profile Strength
        </h2>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getLevelColor(profileStrength.level)}`}>
          {profileStrength.level}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Profile Completion</span>
          <span className="text-sm font-semibold text-gray-800">
            {profileStrength.completedFields}/{profileStrength.totalFields}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              profileStrength.level === 'EXCELLENT' ? 'bg-green-600' :
              profileStrength.level === 'GOOD' ? 'bg-blue-600' :
              profileStrength.level === 'FAIR' ? 'bg-yellow-600' :
              'bg-red-600'
            }`}
            style={{ width: `${profileStrength.score}%` }}
          ></div>
        </div>
        <p className={`text-2xl font-bold mt-2 ${getLevelColor(profileStrength.level)}`}>
          {profileStrength.score}%
        </p>
      </div>

      {/* Recommendations */}
      {profileStrength.recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Recommendations to Improve
          </h3>
          <div className="space-y-2">
            {profileStrength.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {profileStrength.recommendations.length === 0 && (
        <div className="flex items-center gap-3 p-4 bg-green-100 rounded-lg">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800 font-semibold">Your profile is complete! Keep it updated.</p>
        </div>
      )}
    </div>
  );
};
