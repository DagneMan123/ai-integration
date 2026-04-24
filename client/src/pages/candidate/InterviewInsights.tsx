import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import Loading from '../../components/Loading';

const InterviewInsights: React.FC = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch interview insights
    setLoading(false);
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Interview Insights</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold">Performance Trend</h2>
          </div>
          <p className="text-gray-600">Your interview performance over time</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 size={24} className="text-green-600" />
            <h2 className="text-xl font-semibold">Skill Analysis</h2>
          </div>
          <p className="text-gray-600">Breakdown of your key skills</p>
        </div>
      </div>
    </div>
  );
};

export default InterviewInsights;
