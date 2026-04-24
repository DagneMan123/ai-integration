import React from 'react';
import { Lightbulb, CheckCircle } from 'lucide-react';

const InterviewTips: React.FC = () => {
  const tips = [
    'Speak clearly and maintain a professional tone',
    'Listen carefully to each question before answering',
    'Provide specific examples from your experience',
    'Ask clarifying questions if needed',
    'Take a moment to think before responding',
    'Show enthusiasm for the role and company'
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Interview Tips</h1>
      <div className="space-y-4">
        {tips.map((tip, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow flex items-start gap-4">
            <Lightbulb size={24} className="text-yellow-500 flex-shrink-0 mt-1" />
            <p className="text-gray-700">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewTips;
