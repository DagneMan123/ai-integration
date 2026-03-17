import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';

interface SessionData {
  userId: string;
  loginTime: Date;
  lastActivityTime: Date;
  sessionDuration: number;
  pageVisits: string[];
  currentPage: string;
  isActive: boolean;
}

export const useSessionMonitoring = () => {
  const { user } = useAuthStore();
  const sessionDataRef = useRef<SessionData | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    // Initialize session
    if (!sessionDataRef.current) {
      sessionDataRef.current = {
        userId: user.id,
        loginTime: new Date(),
        lastActivityTime: new Date(),
        sessionDuration: 0,
        pageVisits: [window.location.pathname],
        currentPage: window.location.pathname,
        isActive: true
      };
    }

    // Track page visits
    const handlePageChange = () => {
      if (sessionDataRef.current) {
        const currentPath = window.location.pathname;
        if (!sessionDataRef.current.pageVisits.includes(currentPath)) {
          sessionDataRef.current.pageVisits.push(currentPath);
        }
        sessionDataRef.current.currentPage = currentPath;
      }
    };

    // Track user activity
    const handleActivity = () => {
      if (sessionDataRef.current) {
        sessionDataRef.current.lastActivityTime = new Date();
        sessionDataRef.current.isActive = true;

        // Clear existing timeout
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
        }

        // Set new inactivity timeout (15 minutes)
        inactivityTimeoutRef.current = setTimeout(() => {
          if (sessionDataRef.current) {
            sessionDataRef.current.isActive = false;
          }
        }, 15 * 60 * 1000);
      }
    };

    // Update session duration
    const updateDuration = () => {
      if (sessionDataRef.current) {
        const now = new Date();
        sessionDataRef.current.sessionDuration = Math.floor(
          (now.getTime() - sessionDataRef.current.loginTime.getTime()) / 1000
        );
      }
    };

    // Event listeners
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('popstate', handlePageChange);

    // Update duration every second
    const durationInterval = setInterval(updateDuration, 1000);

    // Store session data in localStorage
    const storageInterval = setInterval(() => {
      if (sessionDataRef.current) {
        localStorage.setItem(
          `session_${user.id}`,
          JSON.stringify(sessionDataRef.current)
        );
      }
    }, 5000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('popstate', handlePageChange);
      clearInterval(durationInterval);
      clearInterval(storageInterval);
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [user]);

  return sessionDataRef.current;
};
