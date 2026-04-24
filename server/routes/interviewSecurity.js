const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const prisma = require('../lib/prisma');

/**
 * Interview Security Routes
 * Handles logging of security violations during interviews
 */

// Log security violation
router.post('/security-violation', authenticateToken, async (req, res, next) => {
  try {
    const { interviewId, violationType, details, timestamp, violationCount } = req.body;
    const userId = req.user.id;

    if (!interviewId || !violationType) {
      return res.status(400).json({
        success: false,
        message: 'interviewId and violationType are required'
      });
    }

    // Verify interview belongs to user
    const interview = await prisma.interview.findUnique({
      where: { id: parseInt(interviewId) }
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.candidateId !== userId) {
      logger.warn('[interviewSecurity] Unauthorized violation report attempt', {
        interviewId,
        userId,
        interviewCandidateId: interview.candidateId
      });
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Get existing anti-cheat data
    const antiCheatData = interview.antiCheatData || {
      tabSwitches: 0,
      copyPasteAttempts: 0,
      rightClickAttempts: 0,
      keyboardShortcutAttempts: 0,
      blurEvents: 0,
      suspiciousActivities: []
    };

    // Update violation counts
    switch (violationType) {
      case 'copy':
      case 'paste':
      case 'cut':
        antiCheatData.copyPasteAttempts = (antiCheatData.copyPasteAttempts || 0) + 1;
        break;
      case 'right_click':
        antiCheatData.rightClickAttempts = (antiCheatData.rightClickAttempts || 0) + 1;
        break;
      case 'keyboard_shortcut':
        antiCheatData.keyboardShortcutAttempts = (antiCheatData.keyboardShortcutAttempts || 0) + 1;
        break;
      case 'tab_switch':
        antiCheatData.tabSwitches = (antiCheatData.tabSwitches || 0) + 1;
        break;
      case 'blur':
        antiCheatData.blurEvents = (antiCheatData.blurEvents || 0) + 1;
        break;
    }

    // Add to suspicious activities log
    if (!antiCheatData.suspiciousActivities) {
      antiCheatData.suspiciousActivities = [];
    }

    antiCheatData.suspiciousActivities.push({
      type: violationType,
      details: details,
      timestamp: new Date(timestamp),
      count: violationCount
    });

    // Keep only last 100 activities
    if (antiCheatData.suspiciousActivities.length > 100) {
      antiCheatData.suspiciousActivities = antiCheatData.suspiciousActivities.slice(-100);
    }

    // Update interview with new anti-cheat data
    const updatedInterview = await prisma.interview.update({
      where: { id: parseInt(interviewId) },
      data: {
        antiCheatData: antiCheatData,
        updatedAt: new Date()
      }
    });

    // Calculate integrity score
    const integrityScore = calculateIntegrityScore(antiCheatData);

    logger.info('[interviewSecurity] Security violation logged', {
      interviewId,
      userId,
      violationType,
      violationCount,
      totalCopyPasteAttempts: antiCheatData.copyPasteAttempts,
      totalTabSwitches: antiCheatData.tabSwitches,
      totalBlurEvents: antiCheatData.blurEvents,
      integrityScore
    });

    res.json({
      success: true,
      message: 'Security violation logged',
      data: {
        interviewId,
        violationType,
        antiCheatData,
        integrityScore
      }
    });
  } catch (error) {
    logger.error('[interviewSecurity] Error logging security violation', {
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
});

// Get interview security report
router.get('/:interviewId/security-report', authenticateToken, async (req, res, next) => {
  try {
    const interviewId = parseInt(req.params.interviewId);
    const userId = req.user.id;

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId }
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Allow access for candidate or employer of the job
    const job = await prisma.job.findUnique({
      where: { id: interview.jobId }
    });

    if (interview.candidateId !== userId && job.createdById !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const antiCheatData = interview.antiCheatData || {};
    const integrityScore = calculateIntegrityScore(antiCheatData);

    const report = {
      interviewId,
      candidateId: interview.candidateId,
      jobId: interview.jobId,
      status: interview.status,
      startedAt: interview.startedAt,
      completedAt: interview.completedAt,
      antiCheatData,
      integrityScore,
      integrityRisk: getIntegrityRisk(integrityScore),
      violations: {
        copyPasteAttempts: antiCheatData.copyPasteAttempts || 0,
        rightClickAttempts: antiCheatData.rightClickAttempts || 0,
        keyboardShortcutAttempts: antiCheatData.keyboardShortcutAttempts || 0,
        tabSwitches: antiCheatData.tabSwitches || 0,
        blurEvents: antiCheatData.blurEvents || 0,
        totalViolations: (antiCheatData.copyPasteAttempts || 0) +
                        (antiCheatData.rightClickAttempts || 0) +
                        (antiCheatData.keyboardShortcutAttempts || 0) +
                        (antiCheatData.tabSwitches || 0) +
                        (antiCheatData.blurEvents || 0)
      },
      suspiciousActivities: antiCheatData.suspiciousActivities || [],
      recommendation: getSecurityRecommendation(integrityScore, antiCheatData)
    };

    logger.info('[interviewSecurity] Security report generated', {
      interviewId,
      userId,
      integrityScore,
      integrityRisk: report.integrityRisk
    });

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('[interviewSecurity] Error generating security report', {
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
});

/**
 * Calculate integrity score (0-100)
 * Higher score = more trustworthy interview
 * Lower score = more suspicious activity
 */
function calculateIntegrityScore(antiCheatData) {
  let score = 100;

  // Deduct points for violations
  score -= (antiCheatData.copyPasteAttempts || 0) * 5;      // -5 per attempt
  score -= (antiCheatData.rightClickAttempts || 0) * 3;     // -3 per attempt
  score -= (antiCheatData.keyboardShortcutAttempts || 0) * 4; // -4 per attempt
  score -= (antiCheatData.tabSwitches || 0) * 10;           // -10 per switch
  score -= (antiCheatData.blurEvents || 0) * 8;             // -8 per blur

  // Clamp score between 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Determine integrity risk level
 */
function getIntegrityRisk(integrityScore) {
  if (integrityScore >= 80) return 'LOW';
  if (integrityScore >= 60) return 'MEDIUM';
  if (integrityScore >= 40) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Get security recommendation based on integrity score
 */
function getSecurityRecommendation(integrityScore, antiCheatData) {
  const totalViolations = (antiCheatData.copyPasteAttempts || 0) +
                         (antiCheatData.rightClickAttempts || 0) +
                         (antiCheatData.keyboardShortcutAttempts || 0) +
                         (antiCheatData.tabSwitches || 0) +
                         (antiCheatData.blurEvents || 0);

  if (integrityScore >= 80 && totalViolations === 0) {
    return 'TRUSTWORTHY - No suspicious activity detected';
  } else if (integrityScore >= 60) {
    return 'ACCEPTABLE - Minor suspicious activity detected';
  } else if (integrityScore >= 40) {
    return 'SUSPICIOUS - Multiple violations detected, review recommended';
  } else {
    return 'HIGHLY SUSPICIOUS - Significant cheating indicators, manual review required';
  }
}

module.exports = router;
