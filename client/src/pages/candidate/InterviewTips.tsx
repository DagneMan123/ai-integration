import React from 'react';
import { Zap, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';

const InterviewTips: React.FC = () => {
  const tips = [
    {
      category: 'Before the Interview',
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'bg-yellow-50 border-yellow-200',
      items: [
        'Test your internet connection at least 30 minutes before',
        'Ensure your camera and microphone are working properly',
        'Find a quiet, well-lit room with a neutral background',
        'Wear professional attire appropriate for the role',
        'Have a glass of water nearby',
        'Close unnecessary browser tabs and applications',
        'Silence your phone and other notifications'
      ]
    },
    {
      category: 'During the Interview',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-blue-50 border-blue-200',
      items: [
        'Maintain eye contact with the camera',
        'Speak clearly and at a moderate pace',
        'Listen carefully to each question before answering',
        'Take a moment to think before responding',
        'Use specific examples from your experience',
        'Show enthusiasm and positive body language',
        'Avoid filler words like "um" and "uh"'
      ]
    },
    {
      category: 'Communication Tips',
      icon: <Lightbulb className="w-6 h-6" />,
      color: 'bg-purple-50 border-purple-200',
      items: [
        'Structure your answers: Situation, Action, Result (SAR)',
        'Be concise but thorough in your responses',
        'Highlight relevant skills and achievements',
        'Ask clarifying questions if needed',
        'Show genuine interest in the role and company',
        'Provide concrete examples and metrics',
        'Demonstrate problem-solving abilities'
      ]
    },
    {
      category: 'Technical Excellence',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-emerald-50 border-emerald-200',
      items: [
        'Position your camera at eye level',
        'Ensure adequate lighting on your face',
        'Use a professional background or blur it',
        'Dress professionally from head to toe',
        'Sit upright with good posture',
        'Minimize distractions in your environment',
        'Have your resume ready for reference'
      ]
    }
  ];

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl p-12 text-white">
            <div className="flex items-start gap-4">
              <Zap className="w-12 h-12 flex-shrink-0" />
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">Interview Tips</h1>
                <p className="text-yellow-100 text-lg">Master the art of AI interviews</p>
              </div>
            </div>
          </div>

          {/* Tips Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((section, idx) => (
              <div key={idx} className={`border rounded-2xl p-6 ${section.color}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-yellow-600">{section.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900">{section.category}</h3>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Pro Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Pro Tips for Success</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Practice Makes Perfect</h4>
                  <p className="text-gray-700 text-sm">Use our Practice Mode to familiarize yourself with the interview format and build confidence.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Review Your Feedback</h4>
                  <p className="text-gray-700 text-sm">After each interview, review the AI feedback to identify areas for improvement.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Stay Calm and Confident</h4>
                  <p className="text-gray-700 text-sm">Remember that the AI is evaluating your skills, not judging you. Be authentic and genuine.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Prepare Your Stories</h4>
                  <p className="text-gray-700 text-sm">Have 3-5 compelling stories ready that showcase your skills and achievements.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewTips;
