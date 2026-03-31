import React from 'react';
import { BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';

const GettingStarted: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: 'Create Your Account',
      description: 'Sign up with your email and create a strong password. Verify your email address to activate your account.',
      details: [
        'Visit the registration page',
        'Enter your email and password',
        'Verify your email via the confirmation link',
        'Complete your profile setup'
      ]
    },
    {
      number: 2,
      title: 'Complete Your Profile',
      description: 'Add your professional information, skills, and experience to help employers find you.',
      details: [
        'Upload a professional photo',
        'Add your work experience',
        'List your skills and certifications',
        'Write a compelling bio'
      ]
    },
    {
      number: 3,
      title: 'Browse and Apply for Jobs',
      description: 'Explore available job opportunities and submit your applications.',
      details: [
        'Search jobs by title or location',
        'Save jobs for later',
        'Set up job alerts',
        'Apply to positions'
      ]
    },
    {
      number: 4,
      title: 'Prepare for Interviews',
      description: 'Use our practice mode to prepare for AI interviews.',
      details: [
        'Run system check',
        'Practice with sample questions',
        'Review interview tips',
        'Test your equipment'
      ]
    },
    {
      number: 5,
      title: 'Attend Your Interview',
      description: 'Join your scheduled interview and showcase your skills.',
      details: [
        'Ensure stable internet connection',
        'Find a quiet environment',
        'Test camera and microphone',
        'Answer questions clearly'
      ]
    },
    {
      number: 6,
      title: 'Review Your Results',
      description: 'Get detailed feedback on your interview performance.',
      details: [
        'View your score',
        'Read AI feedback',
        'Identify improvement areas',
        'Track your progress'
      ]
    }
  ];

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white">
            <div className="flex items-start gap-4">
              <BookOpen className="w-12 h-12 flex-shrink-0" />
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">Getting Started</h1>
                <p className="text-blue-100 text-lg">Learn how to set up your account and get started</p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
            <p className="text-gray-700 mb-6">Follow these steps to set up your account and start your journey with us.</p>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all">
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GettingStarted;
