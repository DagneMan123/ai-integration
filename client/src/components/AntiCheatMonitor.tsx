import React, { useEffect, useRef, useState, useCallback } from 'react';
import { interviewAPI } from '../utils/api';
import toast from 'react-hot-toast';

interface AntiCheatMonitorProps {
  interviewId: string;
  maxViolations?: number; // Maximum allowed violations before termination
  onViolationLimitExceeded?: () => void; // Callback when user exceeds limit
  onViolation?: (violation: any) => void; // Callback for each violation
}

const AntiCheatMonitor: React.FC<AntiCheatMonitorProps> = ({ 
  interviewId, 
  maxViolations = 3, 
  onViolationLimitExceeded,
  onViolation
}) => {
  const [violations, setViolations] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const windowBlurStartRef = useRef<number | null>(null);

  // 1. Log event to backend (Reusable utility)
  const logEvent = useCallback(async (eventType: string, data: any) => {
    try {
      await interviewAPI.recordAntiCheatEvent(interviewId, {
        eventType,
        timestamp: new Date().toISOString(),
        data
      });
    } catch (err) {
      console.error(`Proctoring Error [${eventType}]:`, err);
    }
  }, [interviewId]);

  // 2. Handle security violations (Strike System)
  const handleViolation = useCallback((type: string, message: string) => {
    setViolations((prev) => {
      const newCount = prev + 1;
      
      if (newCount >= maxViolations) {
        toast.error("Interview Terminated! Maximum security violations exceeded.", { 
            duration: 5000,
            id: 'critical-violation' 
        });
        onViolationLimitExceeded?.();
      } else {
        toast.error(`${message} (Warning: ${newCount}/${maxViolations})`, {
          icon: '🚫',
          style: { borderRadius: '8px', background: '#1e293b', color: '#fff' },
        });
      }
      
      onViolation?.({ type, message, count: newCount });
      return newCount;
    });

    logEvent(type, { violationCount: violations + 1 });
  }, [maxViolations, onViolationLimitExceeded, onViolation, logEvent, violations]);

  useEffect(() => {
    // 3. Browser Fingerprinting
    const collectFingerprint = () => {
      logEvent('BROWSER_FINGERPRINT', {
        userAgent: navigator.userAgent,
        resolution: `${window.screen.width}x${window.screen.height}`,
        platform: navigator.platform,
        language: navigator.language
      });
    };

    // 4. Fullscreen Enforcement
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        handleViolation('EXIT_FULLSCREEN', 'Please remain in Fullscreen mode during the interview.');
      } else {
        setIsFullscreen(true);
      }
    };

    // 5. Visibility/Tab Switch Detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        windowBlurStartRef.current = Date.now();
      } else if (windowBlurStartRef.current) {
        const duration = (Date.now() - windowBlurStartRef.current) / 1000;
        windowBlurStartRef.current = null;
        handleViolation('TAB_SWITCH', `Unauthorized tab switch detected (${duration.toFixed(1)}s).`);
      }
    };

    // 6. Restrict Keyboard Actions (Copy, Paste, DevTools)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Copy, Paste, Cut
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        handleViolation('KEYBOARD_SHORTCUT', 'Copying or pasting is strictly prohibited.');
      }
      
      // Prevent Developer Tools (F12, Ctrl+Shift+I)
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        handleViolation('DEV_TOOLS', 'Accessing developer tools is not allowed.');
      }
    };

    // 7. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Initialize monitoring
    collectFingerprint();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleViolation, logEvent]);

  // Mandatory Fullscreen Request
  const enterFullscreen = () => {
    document.documentElement.requestFullscreen().catch(() => {
      toast.error("Unable to enter Fullscreen. Please check browser permissions.");
    });
  };

  return (
    <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-white/95 backdrop-blur-sm shadow-xl rounded-xl p-4 border border-slate-200 min-w-[220px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${violations === 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${violations === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider italic">
              AI Proctoring Active
            </span>
          </div>
          
          {!isFullscreen && (
            <button 
              onClick={enterFullscreen}
              className="text-[10px] font-semibold bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors shadow-sm"
            >
              ENABLE FULLSCREEN
            </button>
          )}
        </div>
        
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-1.5 rounded-full transition-all duration-700 ease-out ${violations > 1 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
              style={{ width: `${Math.max(0, 100 - (violations / maxViolations) * 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
            <span>Security Integrity Score</span>
            <span className={`font-bold ${violations > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {Math.max(0, 100 - (violations * (100 / maxViolations)))}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AntiCheatMonitor;