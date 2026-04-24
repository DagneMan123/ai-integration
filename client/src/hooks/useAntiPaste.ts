import { useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { interviewAPI } from '../utils/api';

interface UseAntiPasteOptions {
  interviewId?: number;
  onCheatingDetected?: () => void;
  enabled?: boolean;
}

export const useAntiPaste = (options: UseAntiPasteOptions = {}) => {
  const { interviewId, onCheatingDetected, enabled = true } = options;
  const pasteAttemptCountRef = useRef(0);
  const lastPasteTimeRef = useRef(0);

  // Log paste attempt to backend
  const logPasteAttempt = useCallback(async (method: string) => {
    if (!interviewId) return;

    try {
      await interviewAPI.logSecurityViolation({
        interviewId,
        violationType: 'PASTE_ATTEMPT',
        method,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log paste attempt:', error);
    }
  }, [interviewId]);

  // Handle paste event
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (!enabled) return;

    e.preventDefault();
    e.stopPropagation();

    pasteAttemptCountRef.current++;
    lastPasteTimeRef.current = Date.now();

    logPasteAttempt('onPaste');
    toast.error('🚨 PASTE BLOCKED - This action is prohibited and has been logged');

    if (onCheatingDetected) {
      onCheatingDetected();
    }

    return false;
  }, [enabled, logPasteAttempt, onCheatingDetected]);

  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (!enabled) return;

    e.preventDefault();
    e.stopPropagation();

    pasteAttemptCountRef.current++;
    lastPasteTimeRef.current = Date.now();

    logPasteAttempt('onDrop');
    toast.error('🚨 DRAG & DROP BLOCKED - This action is prohibited and has been logged');

    if (onCheatingDetected) {
      onCheatingDetected();
    }

    return false;
  }, [enabled, logPasteAttempt, onCheatingDetected]);

  // Handle context menu (right-click)
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (!enabled) return;

    e.preventDefault();
    e.stopPropagation();
    return false;
  }, [enabled]);

  // Global keyboard listener for Ctrl+V and Cmd+V
  useEffect(() => {
    if (!enabled) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check if paste shortcut is pressed
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        // Check if focus is on an input/textarea
        const target = document.activeElement;
        if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
          e.preventDefault();
          e.stopPropagation();

          pasteAttemptCountRef.current++;
          lastPasteTimeRef.current = Date.now();

          logPasteAttempt('keyboard_shortcut');
          toast.error('🚨 PASTE SHORTCUT BLOCKED - This action is prohibited and has been logged');

          if (onCheatingDetected) {
            onCheatingDetected();
          }
        }
      }

      // Also block Shift+Insert (alternative paste)
      if (e.shiftKey && e.key === 'Insert') {
        const target = document.activeElement;
        if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
          e.preventDefault();
          e.stopPropagation();

          pasteAttemptCountRef.current++;
          lastPasteTimeRef.current = Date.now();

          logPasteAttempt('shift_insert');
          toast.error('🚨 PASTE SHORTCUT BLOCKED - This action is prohibited and has been logged');

          if (onCheatingDetected) {
            onCheatingDetected();
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [enabled, logPasteAttempt, onCheatingDetected]);

  return {
    handlePaste,
    handleDrop,
    handleContextMenu,
    pasteAttemptCount: pasteAttemptCountRef.current,
    lastPasteTime: lastPasteTimeRef.current
  };
};
