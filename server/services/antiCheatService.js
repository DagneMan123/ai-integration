const { logger } = require('../utils/logger');

/**
 * Track and analyze anti-cheating events
 */
class AntiCheatService {
  constructor() {
    this.sessions = new Map(); // Store active interview sessions
  }

  /**
   * Initialize anti-cheat session for an interview
   */
  initializeSession(interviewId, candidateId) {
    this.sessions.set(interviewId, {
      candidateId,
      startTime: new Date(),
      events: [],
      tabSwitches: 0,
      copyPasteAttempts: 0,
      suspiciousActivities: [],
      identitySnapshots: [],
      browserFingerprint: null
    });

    logger.info(`Anti-cheat session initialized for interview ${interviewId}`);
    return this.sessions.get(interviewId);
  }

  /**
   * Record tab switch event
   */
  recordTabSwitch(interviewId, timestamp) {
    const session = this.sessions.get(interviewId);
    if (!session) return;

    session.tabSwitches++;
    session.events.push({
      type: 'TAB_SWITCH',
      timestamp,
      severity: 'MEDIUM'
    });

    // Flag if excessive
    if (session.tabSwitches > 3) {
      session.suspiciousActivities.push({
        type: 'EXCESSIVE_TAB_SWITCHING',
        count: session.tabSwitches,
        timestamp,
        severity: 'HIGH'
      });
    }

    logger.warn(`Tab switch detected for interview ${interviewId}. Total: ${session.tabSwitches}`);
  }

  /**
   * Record copy-paste attempt
   */
  recordCopyPaste(interviewId, timestamp, content) {
    const session = this.sessions.get(interviewId);
    if (!session) return;

    session.copyPasteAttempts++;
    session.events.push({
      type: 'COPY_PASTE_ATTEMPT',
      timestamp,
      contentLength: content?.length || 0,
      severity: 'HIGH'
    });

    session.suspiciousActivities.push({
      type: 'COPY_PASTE_DETECTED',
      timestamp,
      severity: 'HIGH',
      note: 'Candidate attempted to paste content'
    });

    logger.warn(`Copy-paste attempt detected for interview ${interviewId}`);
  }

  /**
   * Record identity verification snapshot
   */
  recordIdentitySnapshot(interviewId, snapshotData) {
    const session = this.sessions.get(interviewId);
    if (!session) return;

    session.identitySnapshots.push({
      timestamp: new Date(),
      imageUrl: snapshotData.imageUrl,
      faceDetected: snapshotData.faceDetected,
      confidence: snapshotData.confidence,
      metadata: snapshotData.metadata
    });

    // Check for face mismatch
    if (!snapshotData.faceDetected) {
      session.suspiciousActivities.push({
        type: 'NO_FACE_DETECTED',
        timestamp: new Date(),
        severity: 'HIGH',
        note: 'No face detected in verification snapshot'
      });
    }

    logger.info(`Identity snapshot recorded for interview ${interviewId}`);
  }

  /**
   * Record browser fingerprint
   */
  recordBrowserFingerprint(interviewId, fingerprint) {
    const session = this.sessions.get(interviewId);
    if (!session) return;

    session.browserFingerprint = {
      userAgent: fingerprint.userAgent,
      screenResolution: fingerprint.screenResolution,
      timezone: fingerprint.timezone,
      language: fingerprint.language,
      platform: fingerprint.platform,
      timestamp: new Date()
    };
  }

  /**
   * Record window blur (user left the window)
   */
  recordWindowBlur(interviewId, timestamp, duration) {
    const session = this.sessions.get(interviewId);
    if (!session) return;

    session.events.push({
      type: 'WINDOW_BLUR',
      timestamp,
      duration,
      severity: 'MEDIUM'
    });

    // Flag if excessive
    if (duration > 10000) { // More than 10 seconds
      session.suspiciousActivities.push({
        type: 'PROLONGED_WINDOW_BLUR',
        duration,
        timestamp,
        severity: 'MEDIUM',
        note: `User left window for ${Math.round(duration / 1000)} seconds`
      });
    }
  }

  /**
   * Record right-click attempt (context menu)
   */
  recordRightClick(interviewId, timestamp) {
    const session = this.sessions.get(interviewId);
    if (!session) return;

    session.events.push({
      type: 'RIGHT_CLICK_ATTEMPT',
      timestamp,
      severity: 'LOW'
    });
  }

  /**
   * Record keyboard shortcut attempt (Ctrl+C, Ctrl+V, etc.)
   */
  recordKeyboardShortcut(interviewId, timestamp, keys) {
    const session = this.sessions.get(interviewId);
    if (!session) return;

    session.events.push({
      type: 'KEYBOARD_SHORTCUT',
      timestamp,
      keys,
      severity: 'MEDIUM'
    });

    // Flag suspicious shortcuts
    const suspiciousKeys = ['ctrl+c', 'ctrl+v', 'ctrl+a', 'ctrl+f'];
    if (suspiciousKeys.includes(keys.toLowerCase())) {
      session.suspiciousActivities.push({
        type: 'SUSPICIOUS_KEYBOARD_SHORTCUT',
        keys,
        timestamp,
        severity: 'MEDIUM'
      });
    }
  }

  /**
   * Get session summary
   */
  getSessionSummary(interviewId) {
    const session = this.sessions.get(interviewId);
    if (!session) return null;

    const duration = new Date() - session.startTime;
    const integrityScore = this.calculateIntegrityScore(session);

    return {
      interviewId,
      candidateId: session.candidateId,
      duration: Math.round(duration / 1000), // seconds
      tabSwitches: session.tabSwitches,
      copyPasteAttempts: session.copyPasteAttempts,
      suspiciousActivities: session.suspiciousActivities,
      totalEvents: session.events.length,
      identitySnapshots: session.identitySnapshots.length,
      integrityScore,
      integrityRisk: integrityScore > 75 ? 'LOW' : integrityScore > 50 ? 'MEDIUM' : 'HIGH',
      recommendation: integrityScore > 75 ? 'TRUSTWORTHY' : integrityScore > 50 ? 'REVIEW_REQUIRED' : 'HIGH_RISK'
    };
  }

  /**
   * Calculate integrity score based on events
   */
  calculateIntegrityScore(sessionOrId) {
    // Support both session object and interviewId
    const session = typeof sessionOrId === 'object' ? sessionOrId : this.sessions.get(sessionOrId);
    if (!session) {
      return { score: 50, riskLevel: 'MEDIUM', reason: 'Session not found' };
    }

    let score = 100;

    // Deduct for tab switches
    score -= session.tabSwitches * 5;

    // Deduct heavily for copy-paste
    score -= session.copyPasteAttempts * 15;

    // Deduct for suspicious activities
    session.suspiciousActivities.forEach(activity => {
      if (activity.severity === 'HIGH') score -= 10;
      else if (activity.severity === 'MEDIUM') score -= 5;
      else score -= 2;
    });

    // Deduct if no identity snapshots
    if (session.identitySnapshots.length === 0) {
      score -= 20;
    }

    // Check for face detection issues
    const failedSnapshots = session.identitySnapshots.filter(s => !s.faceDetected).length;
    score -= failedSnapshots * 10;

    const finalScore = Math.max(0, Math.min(100, score));
    const riskLevel = finalScore > 75 ? 'LOW' : finalScore > 50 ? 'MEDIUM' : 'HIGH';

    return {
      score: finalScore,
      riskLevel,
      details: {
        tabSwitches: session.tabSwitches,
        copyPasteAttempts: session.copyPasteAttempts,
        suspiciousActivities: session.suspiciousActivities.length,
        identityVerified: session.identitySnapshots.length > 0 && failedSnapshots === 0
      }
    };
  }

  /**
   * End session and return final data
   */
  endSession(interviewId) {
    const summary = this.getSessionSummary(interviewId);
    this.sessions.delete(interviewId);
    logger.info(`Anti-cheat session ended for interview ${interviewId}`);
    return summary;
  }

  /**
   * Get active session
   */
  getSession(interviewId) {
    return this.sessions.get(interviewId);
  }
}

// Singleton instance
const antiCheatService = new AntiCheatService();

module.exports = antiCheatService;
