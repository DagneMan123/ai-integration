import React, { useEffect, useRef, useState } from 'react';
import { interviewAPI } from '../utils/api';
import toast from 'react-hot-toast';

interface AntiCheatMonitorProps {
  interviewId: string;
  onViolation?: (type: string) => void;
}

const AntiCheatMonitor: React.FC<AntiCheatMonitorProps> = ({ interviewId, onViolation }) => {
  const [violations, setViolations] = useState(0);
  const windowBlurStartRef = useRef<number | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Collect browser fingerprint
    const collectFingerprint = () => {
      const fingerprint = {
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform
      };

      interviewAPI.recordAntiCheatEvent(interviewId, {
        eventType: 'BROWSER_FINGERPRINT',
        timestamp: new Date().toISOString(),
        data: fingerprint
      }).catch(err => console.error('Failed to record fingerprint:', err));
    };

    // Tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        windowBlurStartRef.current = Date.now();
      } else if (windowBlurStartRef.current) {
        const duration = Date.now() - windowBlurStartRef.current;
        windowBlurStartRef.current = null;

        interviewAPI.recordAntiCheatEvent(interviewId, {
          eventType: 'TAB_SWITCH',
          timestamp: new Date().toISOString(),
          data: { duration }
        }).catch(err => console.error('Failed to record tab switch:', err));

        setViolations(prev => prev + 1);
        toast.error('Tab switch detected! This has been recorded.');
        onViolation?.('TAB_SWITCH');
      }
    };

    // Window blur/focus
    const handleWindowBlur = () => {
      windowBlurStartRef.current = Date.now();
    };

    const handleWindowFocus = () => {
      if (windowBlurStartRef.current) {
        const duration = Date.now() - windowBlurStartRef.current;
        windowBlurStartRef.current = null;

        if (duration > 3000) { // Only record if more than 3 seconds
          interviewAPI.recordAntiCheatEvent(interviewId, {
            eventType: 'WINDOW_BLUR',
            timestamp: new Date().toISOString(),
            data: { duration }
          }).catch(err => console.error('Failed to record window blur:', err));

          toast('Window focus lost. Please stay focused on the interview.', {
            icon: '⚠️',
          });
        }
      }
    };

    // Copy-paste detection
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      
      const content = e.clipboardData?.getData('text') || '';
      
      interviewAPI.recordAntiCheatEvent(interviewId, {
        eventType: 'COPY_PASTE',
        timestamp: new Date().toISOString(),
        data: { content: content.substring(0, 100) } // Only send first 100 chars
      }).catch(err => console.error('Failed to record paste:', err));

      setViolations(prev => prev + 1);
      toast.error('Paste is not allowed during the interview!');
      onViolation?.('COPY_PASTE');
    };

    // Context menu (right-click) prevention
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast('Right-click is disabled during the interview.', {
        icon: '⚠️',
      });
    };

    // Keyboard shortcuts detection
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect common copy-paste shortcuts
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
        if (e.key.toLowerCase() === 'v') {
          e.preventDefault();
          toast.error('Paste is not allowed!');
        }
      }

      // Detect developer tools shortcuts
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        toast('Developer tools are not allowed during the interview.', {
          icon: '⚠️',
        });
      }
    };

    // Initialize
    collectFingerprint();

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [interviewId, onViolation]);

  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-3 border border-gray-200 z-50">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${violations === 0 ? 'bg-green-500' : violations < 3 ? 'bg-yellow-500' : 'bg-red-500'}`} />
        <span className="text-sm font-medium text-gray-700">
          Monitoring Active
        </span>
      </div>
      {violations > 0 && (
        <p className="text-xs text-red-600 mt-1">
          {violations} violation{violations > 1 ? 's' : ''} detected
        </p>
      )}
    </div>
  );
};

export default AntiCheatMonitor;
