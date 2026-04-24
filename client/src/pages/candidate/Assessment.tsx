import React from 'react';
import { BarChart3, Target } from 'lucide-react';

const Assessment: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Assessment</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4 mb-4">
          <Target size={32} className="text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold">Take Assessment</h2>
            <p className="text-gray-600">Evaluate your skills with our assessment tools</p>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Start Assessment
        </button>
      </div>
    </div>
  );
};

export default Assessment;
