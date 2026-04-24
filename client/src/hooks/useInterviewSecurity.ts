import { useEffect, useRef, useCallback } from 'react';
import { logger } from '../utils/logger';

interface SecurityViolation {
  type: 'copy' | 'paste' | 'cut' | 'right_click' | 'tab_switch' | 'blur' | 'keyboard_shortcut';
  timestamp: Date;
  details?: string;
}

interface UseInterviewSecurityOptions {
  interviewId: number;
  onViolation?: (violation: SecurityViolation) => void;
  enableTextSelection?: boolean;
  enableRightClick?: boolean;
  enablePaste?: boolean;
  enableKeyboardShortcuts?: boolean;
  enableTabSwitchDetection?: boolean;
  enableBlurDetection?: boolean;
}

/**
 * Hook to enforce interview security measures
 * Prevents cheating through:
 * - Text selection/copying
 * - Right-click context menu
 * - Keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+X)
 * - Tab switching
 * - Window blur/focus loss
 * - Paste operations on input fields
 */
export const useInterviewSecurity = (options: UseInterviewSecurityOptions) => {
  const {
    interviewId,
    onViolation,
    enableTextSelection = true,
    enableRightClick = true,
    enablePaste = true,
    enableKeyboardShortcuts = true,
    enableTabSwitchDetection = true,
    enableBlurDetection = true
  } = options;

  const violationCountRef = useRef(0);
  const tabSwitchCountRef = useRef(0);
  const blurCountRef = useRef(0);
  const isPageVisibleRef = useRef(true);

  // Log violation to backend
  const logViolation = useCallback((violation: SecurityViolation) => {
    violationCountRef.current++;
    
    logger.warn(`[Interview Security] ${violation.type} violation detected`, {
      interviewId,
      violationType: violation.type,
      violationCount: violationCountRef.current,
      details: violation.details,
      timestamp: violation.timestamp
    });

    // Call parent callback if provided
    if (onViolation) {
      onViolation(violation);
    }

    // Send to backend
    try {
      fetch('/api/interviews/security-violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          violationType: violation.type,
          details: violation.details,
          timestamp: violation.timestamp,
          violationCount: violationCountRef.current
        })
      }).catch(err => logger.error('Failed to log security violation:', err));
    } catch (error) {
      logger.error('Error logging security violation:', error);
    }
  }, [interviewId, onViolation]);

  // 1. DISABLE TEXT SELECTION
  useEffect(() => {
    if (!enableTextSelection) return;

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      logViolation({
        type: 'copy',
        timestamp: new Date(),
        details: 'Text selection attempted'
      });
      return false;
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation({
        type: 'copy',
        timestamp: new Date(),
        details: 'Copy operation attempted'
      });
      return false;
    };

    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('copy', handleCopy);
    };
  }, [enableTextSelection, logViolation]);

  // 2. DISABLE RIGHT-CLICK CONTEXT MENU
  useEffect(() => {
    if (!enableRightClick) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logViolation({
        type: 'right_click',
        timestamp: new Date(),
        details: 'Right-click context menu attempted'
      });
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [enableRightClick, logViolation]);

  // 3. DISABLE KEYBOARD SHORTCUTS (Ctrl+C, Ctrl+V, Ctrl+X)
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C (Copy)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        logViolation({
          type: 'keyboard_shortcut',
          timestamp: new Date(),
          details: 'Ctrl+C (Copy) attempted'
        });
        return false;
      }

      // Ctrl+V (Paste)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        logViolation({
          type: 'keyboard_shortcut',
          timestamp: new Date(),
          details: 'Ctrl+V (Paste) attempted'
        });
        return false;
      }

      // Ctrl+X (Cut)
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault();
        logViolation({
          type: 'keyboard_shortcut',
          timestamp: new Date(),
          details: 'Ctrl+X (Cut) attempted'
        });
        return false;
      }

      // Ctrl+A (Select All) - optional
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        logViolation({
          type: 'keyboard_shortcut',
          timestamp: new Date(),
          details: 'Ctrl+A (Select All) attempted'
        });
        return false;
      }

      // F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        logViolation({
          type: 'keyboard_shortcut',
          timestamp: new Date(),
          details: 'F12 (Developer Tools) attempted'
        });
        return false;
      }

      // Ctrl+Shift+I (Developer Tools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        logViolation({
          type: 'keyboard_shortcut',
          timestamp: new Date(),
          details: 'Ctrl+Shift+I (Developer Tools) attempted'
        });
        return false;
      }

      // Ctrl+Shift+J (Developer Tools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        logViolation({
          type: 'keyboard_shortcut',
          timestamp: new Date(),
          details: 'Ctrl+Shift+J (Developer Tools) attempted'
        });
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableKeyboardShortcuts, logViolation]);

  // 4. TAB-SWITCHING DETECTION
  useEffect(() => {
    if (!enableTabSwitchDetection) return;

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      
      if (!isVisible) {
        tabSwitchCountRef.current++;
        isPageVisibleRef.current = false;
        
        logViolation({
          type: 'tab_switch',
          timestamp: new Date(),
          details: `Tab switched away (count: ${tabSwitchCountRef.current})`
        });

        // Show warning message
        console.warn('⚠️ Tab switch detected! This incident has been logged.');
      } else {
        isPageVisibleRef.current = true;
        console.log('✓ Tab returned to focus');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enableTabSwitchDetection, logViolation]);

  // 5. BLUR DETECTION (Window loses focus)
  useEffect(() => {
    if (!enableBlurDetection) return;

    const handleBlur = () => {
      blurCountRef.current++;
      
      logViolation({
        type: 'blur',
        timestamp: new Date(),
        details: `Window blur detected (count: ${blurCountRef.current})`
      });

      console.warn('⚠️ Window lost focus! This incident has been logged.');
    };

    const handleFocus = () => {
      console.log('✓ Window regained focus');
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enableBlurDetection, logViolation]);

  // 6. BLOCK PASTE ON INPUT FIELDS
  useEffect(() => {
    if (!enablePaste) return;

    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if target is an input or textarea
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        e.preventDefault();
        
        logViolation({
          type: 'paste',
          timestamp: new Date(),
          details: `Paste attempted on ${target.tagName}`
        });

        // Show user feedback
        const originalBg = target.style.backgroundColor;
        target.style.backgroundColor = '#ffcccc';
        setTimeout(() => {
          target.style.backgroundColor = originalBg;
        }, 500);

        return false;
      }
    };

    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [enablePaste, logViolation]);

  // Return security stats
  return {
    violationCount: violationCountRef.current,
    tabSwitchCount: tabSwitchCountRef.current,
    blurCount: blurCountRef.current,
    isPageVisible: isPageVisibleRef.current
  };
};

export default useInterviewSecurity;
