import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';

const SystemCheck: React.FC = () => {
  const [checks, setChecks] = useState([
    { id: 'camera', name: 'Camera', status: 'pending' },
    { id: 'microphone', name: 'Microphone', status: 'pending' },
    { id: 'internet', name: 'Internet Connection', status: 'pending' },
    { id: 'browser', name: 'Browser Compatibility', status: 'pending' },
  ]);

  useEffect(() => {
    // Simulate system checks
    const timer = setTimeout(() => {
      setChecks(prev => prev.map(check => ({
        ...check,
        status: Math.random() > 0.2 ? 'success' : 'warning'
      })));
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusIcon = (status: string) => {
    if (status === 'pending') return <Loader className="w-5 h-5 text-gray-400 animate-spin" />;
    if (status === 'success') return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  const allPassed = checks.every(c => c.status === 'success');

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Check</h1>
            <p className="text-gray-500 font-medium mt-1">Verify your setup before starting an interview</p>
          </div>

          {/* Status Card */}
          <div className={`p-6 rounded-2xl border-2 ${allPassed ? 'bg-emerald-50 border-emerald-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center gap-3">
              {allPassed ? (
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              )}
              <div>
                <h3 className={`font-bold ${allPassed ? 'text-emerald-900' : 'text-yellow-900'}`}>
                  {allPassed ? 'All systems ready!' : 'Some checks need attention'}
                </h3>
                <p className={`text-sm ${allPassed ? 'text-emerald-700' : 'text-yellow-700'}`}>
                  {allPassed ? 'You\'re ready to start your interview' : 'Please fix the issues below'}
                </p>
              </div>
            </div>
          </div>

          {/* Checks List */}
          <div className="space-y-3">
            {checks.map((check) => (
              <div key={check.id} className="p-4 bg-white border border-gray-100 rounded-xl flex items-center justify-between hover:shadow-md transition-all">
                <span className="font-medium text-gray-900">{check.name}</span>
                {getStatusIcon(check.status)}
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button className={`w-full py-3 rounded-xl font-bold transition-all ${
            allPassed
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`} disabled={!allPassed}>
            {allPassed ? 'Start Interview' : 'Fix Issues First'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemCheck;
