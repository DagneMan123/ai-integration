import React from 'react';
import { BookOpen, CheckCircle, Zap } from 'lucide-react';

const GettingStarted: React.FC = () => {
  const steps = [
    { title: 'Complete Your Profile', description: 'Add your resume and professional details' },
    { title: 'Practice Interviews', description: 'Take practice interviews to prepare' },
    { title: 'Apply to Jobs', description: 'Browse and apply to job opportunities' },
    { title: 'Interview & Succeed', description: 'Complete interviews and get hired' }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Getting Started</h1>
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow flex items-start gap-4">
            <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              {idx + 1}
            </div>
            <div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GettingStarted;
