import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader, Video, Mic, Wifi, Globe, RefreshCw, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';

interface CheckItem {
  id: string;
  name: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  message: string;
  details: string;
  iconName: 'video' | 'mic' | 'wifi' | 'globe';
  fixSteps?: string[];
}

const getIcon = (iconName: string) => {
  const iconProps = 'w-5 h-5';
  const icons: Record<string, React.ReactNode> = {
    video: <Video className={iconProps} />,
    mic: <Mic className={iconProps} />,
    wifi: <Wifi className={iconProps} />,
    globe: <Globe className={iconProps} />
  };
  return icons[iconName] || null;
};

const SystemCheck: React.FC = () => {
  const [checks, setChecks] = useState<CheckItem[]>([
    { id: 'camera', name: 'Camera', status: 'pending', message: 'Checking camera access...', details: '', iconName: 'video', fixSteps: ['Check if camera is connected', 'Allow camera permission in browser', 'Disable any camera blocking software', 'Try a different browser'] },
    { id: 'microphone', name: 'Microphone', status: 'pending', message: 'Checking microphone access...', details: '', iconName: 'mic', fixSteps: ['Check if microphone is connected', 'Allow microphone permission in browser', 'Check volume levels are not muted', 'Try a different browser'] },
    { id: 'internet', name: 'Internet Connection', status: 'pending', message: 'Checking connection...', details: '', iconName: 'wifi', fixSteps: ['Check your internet connection', 'Restart your router', 'Move closer to WiFi router', 'Use wired connection if possible'] },
    { id: 'browser', name: 'Browser Compatibility', status: 'pending', message: 'Checking browser...', details: '', iconName: 'globe', fixSteps: ['Update your browser to latest version', 'Use Chrome, Firefox, Safari, or Edge', 'Disable browser extensions', 'Clear browser cache'] }
  ]);

  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    runSystemChecks();
  }, []);

  const testCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        return { status: 'error' as const, message: 'Camera not supported', details: 'Your browser does not support camera access' };
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return { status: 'success' as const, message: 'Camera working', details: 'Camera is accessible and ready' };
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        return { status: 'warning' as const, message: 'Camera permission denied', details: 'Please allow camera access in browser settings' };
      }
      return { status: 'error' as const, message: 'Camera not available', details: 'Camera is not connected or not accessible' };
    }
  };

  const testMicrophone = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        return { status: 'error' as const, message: 'Microphone not supported', details: 'Your browser does not support microphone access' };
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return { status: 'success' as const, message: 'Microphone working', details: 'Microphone is accessible and ready' };
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        return { status: 'warning' as const, message: 'Microphone permission denied', details: 'Please allow microphone access in browser settings' };
      }
      return { status: 'error' as const, message: 'Microphone not available', details: 'Microphone is not connected or not accessible' };
    }
  };

  const testInternet = () => {
    if (!navigator.onLine) {
      return { status: 'error' as const, message: 'No internet connection', details: 'Please check your internet connection' };
    }
    return { status: 'success' as const, message: 'Internet connected', details: 'Your connection is stable and ready' };
  };

  const testBrowser = () => {
    const userAgent = navigator.userAgent;
    const isSupported = /Chrome|Firefox|Safari|Edge/.test(userAgent);
    if (!isSupported) {
      return { status: 'warning' as const, message: 'Browser may not be fully supported', details: 'Consider using Chrome, Firefox, Safari, or Edge' };
    }
    return { status: 'success' as const, message: 'Browser compatible', details: `${userAgent.split(' ').pop()} is fully supported` };
  };

  const runSystemChecks = async () => {
    setIsChecking(true);
    const updatedChecks = [...checks];
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const cameraCheck = await testCamera();
      updatedChecks[0] = { ...updatedChecks[0], status: cameraCheck.status, message: cameraCheck.message, details: cameraCheck.details };
      const microphoneCheck = await testMicrophone();
      updatedChecks[1] = { ...updatedChecks[1], status: microphoneCheck.status, message: microphoneCheck.message, details: microphoneCheck.details };
      const internetCheck = testInternet();
      updatedChecks[2] = { ...updatedChecks[2], status: internetCheck.status, message: internetCheck.message, details: internetCheck.details };
      const browserCheck = testBrowser();
      updatedChecks[3] = { ...updatedChecks[3], status: browserCheck.status, message: browserCheck.message, details: browserCheck.details };
      setChecks(updatedChecks);
    } catch (error) {
      console.error('System check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      success: 'bg-emerald-50 border-emerald-200',
      warning: 'bg-amber-50 border-amber-200',
      error: 'bg-red-50 border-red-200'
    };
    return colors[status] || 'bg-gray-50 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <Loader className="w-5 h-5 text-gray-400 animate-spin" />,
      success: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      warning: <AlertCircle className="w-5 h-5 text-amber-600" />,
      error: <AlertCircle className="w-5 h-5 text-red-600" />
    };
    return icons[status] || null;
  };

  const getStatusTextColor = (status: string) => {
    const colors: Record<string, string> = {
      success: 'text-emerald-900',
      warning: 'text-amber-900',
      error: 'text-red-900'
    };
    return colors[status] || 'text-gray-900';
  };

  const allPassed = checks.every(c => c.status === 'success');
  const hasErrors = checks.some(c => c.status === 'error');
  const passedCount = checks.filter(c => c.status === 'success').length;

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-3xl mx-auto space-y-8 pb-10 p-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-gray-900">System Check</h1>
            <p className="text-gray-600 font-medium">Verify your setup before starting an interview</p>
          </div>

          <div className={`p-8 rounded-2xl border-2 transition-all ${allPassed ? 'bg-emerald-50 border-emerald-200' : hasErrors ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {allPassed ? <CheckCircle className="w-8 h-8 text-emerald-600" /> : hasErrors ? <AlertCircle className="w-8 h-8 text-red-600" /> : <AlertCircle className="w-8 h-8 text-amber-600" />}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${allPassed ? 'text-emerald-900' : hasErrors ? 'text-red-900' : 'text-amber-900'}`}>
                  {allPassed ? '✓ All systems ready!' : hasErrors ? '✗ Critical issues found' : '⚠ Some checks need attention'}
                </h3>
                <p className={`text-sm mt-1 ${allPassed ? 'text-emerald-700' : hasErrors ? 'text-red-700' : 'text-amber-700'}`}>
                  {allPassed ? 'You\'re ready to start your interview' : hasErrors ? 'Please fix critical issues before proceeding' : `${passedCount}/${checks.length} checks passed`}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {checks.map((check) => (
              <div key={check.id} className={`border-2 rounded-2xl transition-all ${getStatusColor(check.status)}`}>
                <button onClick={() => setExpandedCheck(expandedCheck === check.id ? null : check.id)} className="w-full p-6 flex items-center justify-between hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className={`p-3 rounded-lg ${check.status === 'success' ? 'bg-emerald-100' : check.status === 'warning' ? 'bg-amber-100' : check.status === 'error' ? 'bg-red-100' : 'bg-gray-100'}`}>
                      {getIcon(check.iconName)}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${getStatusTextColor(check.status)}`}>{check.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                      {check.details && <p className="text-xs text-gray-500 mt-1">{check.details}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    {check.fixSteps && (expandedCheck === check.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />)}
                  </div>
                </button>

                {expandedCheck === check.id && check.fixSteps && (
                  <div className="px-6 pb-6 border-t-2 border-current border-opacity-10">
                    <div className="space-y-3">
                      <h5 className="font-bold text-sm text-gray-900">How to fix:</h5>
                      <ol className="space-y-2">
                        {check.fixSteps.map((step, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-gray-700">
                            <span className="font-bold text-gray-400 flex-shrink-0">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={runSystemChecks} disabled={isChecking} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
              <RefreshCw className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Re-check'}
            </button>
            <button disabled={!allPassed || isChecking} className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all ${allPassed && !isChecking ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              Start Interview
            </button>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-bold mb-1">Need help?</p>
              <p>All checks must pass before you can start an interview. If you're having issues, try the suggested fixes above or contact support.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemCheck;
