import React, { useState, useEffect } from 'react';
import { AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import useInterviewSecurity from '../hooks/useInterviewSecurity';
import '../styles/interviewSecurity.css';

interface InterviewSecurityWrapperProps {
  interviewId: number;
  children: React.ReactNode;
  onSecurityViolation?: (violation: any) => void;
  showSecurityStatus?: boolean;
  maxViolations?: number;
  onMaxViolationsReached?: () => void;
}

/**
 * Wrapper component that enforces interview security measures
 * Prevents cheating through text selection, copying, tab switching, etc.
 */
const InterviewSecurityWrapper: React.FC<InterviewSecurityWrapperProps> = ({
  interviewId,
  children,
  onSecurityViolation,
  showSecurityStatus = true,
  maxViolations = 5,
  onMaxViolationsReached
}) => {
  const [violations, setViolations] = useState<any[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [securityStatus, setSecurityStatus] = useState<'secure' | 'warning' | 'critical'>('secure');

  const securityStats = useInterviewSecurity({
    interviewId,
    onViolation: (violation) => {
      setViolations(prev => [...prev, violation]);
      
      // Show warning message
      setWarningMessage(getViolationMessage(violation.type));
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);

      // Update security status
      const newViolationCount = violations.length + 1;
      if (newViolationCount >= maxViolations) {
        setSecurityStatus('critical');
        if (onMaxViolationsReached) {
          onMaxViolationsReached();
        }
      } else if (newViolationCount >= Math.ceil(maxViolations / 2)) {
        setSecurityStatus('warning');
      }

      // Call parent callback
      if (onSecurityViolation) {
        onSecurityViolation(violation);
      }
    },
    enableTextSelection: true,
    enableRightClick: true,
    enablePaste: true,
    enableKeyboardShortcuts: true,
    enableTabSwitchDetection: true,
    enableBlurDetection: true
  });

  const getViolationMessage = (type: string): string => {
    const messages: Record<string, string> = {
      copy: '❌ Text copying is not allowed during the interview',
      paste: '❌ Pasting is not allowed during the interview',
      cut: '❌ Text cutting is not allowed during the interview',
      right_click: '❌ Right-click is disabled during the interview',
      tab_switch: '⚠️ Tab switching detected and logged',
      blur: '⚠️ Window focus lost and logged',
      keyboard_shortcut: '❌ This keyboard shortcut is not allowed'
    };
    return messages[type] || '❌ Security violation detected';
  };

  return (
    <div className="interview-secure relative">
      {/* Security Status Bar */}
      {showSecurityStatus && (
        <div className={`security-status-bar mb-4 p-4 rounded-lg flex items-center justify-between ${
          securityStatus === 'critical' ? 'bg-red-50 border border-red-200' :
          securityStatus === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
          'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center gap-3">
            {securityStatus === 'critical' ? (
              <AlertCircle className="text-red-600" size={20} />
            ) : securityStatus === 'warning' ? (
              <AlertCircle className="text-yellow-600" size={20} />
            ) : (
              <Shield className="text-green-600" size={20} />
            )}
            <div>
              <p className={`font-semibold ${
                securityStatus === 'critical' ? 'text-red-900' :
                securityStatus === 'warning' ? 'text-yellow-900' :
                'text-green-900'
              }`}>
                {securityStatus === 'critical' ? 'Critical Security Alert' :
                 securityStatus === 'warning' ? 'Security Warning' :
                 'Interview Secure'}
              </p>
              <p className={`text-sm ${
                securityStatus === 'critical' ? 'text-red-700' :
                securityStatus === 'warning' ? 'text-yellow-700' :
                'text-green-700'
              }`}>
                Violations: {violations.length} / {maxViolations}
                {securityStatus === 'critical' && ' - Maximum violations reached'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Tab Switches: {securityStats.tabSwitchCount} | Blurs: {securityStats.blurCount}
            </span>
            {securityStatus === 'critical' ? (
              <AlertCircle className="text-red-600 animate-pulse" size={24} />
            ) : securityStatus === 'warning' ? (
              <AlertCircle className="text-yellow-600" size={24} />
            ) : (
              <Shield className="text-green-600" size={24} />
            )}
          </div>
        </div>
      )}

      {/* Warning Toast */}
      {showWarning && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-top">
          <AlertCircle size={20} />
          <span className="font-medium">{warningMessage}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="interview-content">
        {children}
      </div>

      {/* Violation Log (for debugging) */}
      {process.env.NODE_ENV === 'development' && violations.length > 0 && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <h3 className="font-bold text-gray-900 mb-3">Security Violations Log (Dev Only)</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {violations.map((v, idx) => (
              <div key={idx} className="text-sm bg-white p-2 rounded border border-gray-200">
                <span className="font-semibold text-gray-700">{v.type}</span>
                <span className="text-gray-600 ml-2">{v.details}</span>
                <span className="text-gray-500 ml-2 text-xs">{new Date(v.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSecurityWrapper;
