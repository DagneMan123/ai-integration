import React from 'react';
import { Briefcase, Play } from 'lucide-react';

const ProfessionalInterview: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Professional Interview</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4 mb-4">
          <Briefcase size={32} className="text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold">Start Professional Interview</h2>
            <p className="text-gray-600">Take a professional-level interview assessment</p>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Play size={18} />
          Start Interview
        </button>
      </div>
    </div>
  );
};

export default ProfessionalInterview;
