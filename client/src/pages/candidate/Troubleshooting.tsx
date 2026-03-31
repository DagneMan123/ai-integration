import React, { useState } from 'react';
import { AlertCircle, ChevronDown, CheckCircle, Wrench } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';

const Troubleshooting: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const issues = [
    {
      id: 'camera',
      title: 'Camera Not Working',
      problem: 'Your camera is not detected or showing a black screen',
      solutions: [
        'Check if your camera is physically connected',
        'Verify camera permissions in your browser settings',
        'Try refreshing the page and running System Check again',
        'Restart your browser and computer',
        'Update your camera drivers',
        'Try a different browser to test if it\'s browser-specific'
      ]
    },
    {
      id: 'microphone',
      title: 'Microphone Issues',
      problem: 'Your microphone is not picking up audio or producing no sound',
      solutions: [
        'Check if microphone is physically connected',
        'Verify microphone permissions in browser settings',
        'Test microphone volume levels in System Check',
        'Ensure no other application is using the microphone',
        'Check if microphone is muted in system settings',
        'Try a different microphone if available'
      ]
    },
    {
      id: 'internet',
      title: 'Internet Connection Problems',
      problem: 'Experiencing lag, disconnections, or slow connection',
      solutions: [
        'Check your internet speed using speedtest.net',
        'Move closer to your WiFi router',
        'Close other applications using bandwidth',
        'Restart your router',
        'Use a wired connection instead of WiFi',
        'Contact your internet service provider if issues persist'
      ]
    },
    {
      id: 'browser',
      title: 'Browser Compatibility',
      problem: 'Features not working or page not loading properly',
      solutions: [
        'Use a supported browser (Chrome, Firefox, Safari, Edge)',
        'Clear your browser cache and cookies',
        'Disable browser extensions that might interfere',
        'Update your browser to the latest version',
        'Try incognito/private browsing mode',
        'Try a different browser to isolate the issue'
      ]
    },
    {
      id: 'login',
      title: 'Login Issues',
      problem: 'Cannot log in or forgot password',
      solutions: [
        'Verify you\'re using the correct email address',
        'Check if Caps Lock is on',
        'Use "Forgot Password" to reset your password',
        'Check your email spam folder for reset link',
        'Clear browser cache and try again',
        'Contact support if you still cannot access your account'
      ]
    },
    {
      id: 'performance',
      title: 'Slow Performance',
      problem: 'Website is loading slowly or freezing',
      solutions: [
        'Close unnecessary browser tabs',
        'Disable browser extensions',
        'Clear browser cache',
        'Restart your browser',
        'Check your internet connection speed',
        'Try accessing during off-peak hours'
      ]
    }
  ];

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl p-12 text-white">
            <div className="flex items-start gap-4">
              <Wrench className="w-12 h-12 flex-shrink-0" />
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">Troubleshooting</h1>
                <p className="text-red-100 text-lg">Solve common technical issues</p>
              </div>
            </div>
          </div>

          {/* Issues */}
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all">
                <button
                  onClick={() => setExpandedId(expandedId === issue.id ? null : issue.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4 text-left flex-1">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{issue.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{issue.problem}</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-400 transition-transform flex-shrink-0 ml-4 ${expandedId === issue.id ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedId === issue.id && (
                  <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
                    <h4 className="font-bold text-gray-900 mb-4">Solutions:</h4>
                    <ul className="space-y-3">
                      {issue.solutions.map((solution, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{solution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still Need Help */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Still having issues?</h3>
            <p className="text-gray-700 mb-6">If none of these solutions work, our support team is here to help.</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Troubleshooting;
