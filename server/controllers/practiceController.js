const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

// Get practice sessions for a user
exports.getPracticeSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await prisma.practiceSessions.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    logger.error('Error fetching practice sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch practice sessions',
      error: error.message
    });
  }
};

// Create a new practice session
exports.createPracticeSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic, difficulty } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }

    const session = await prisma.practiceSessions.create({
      data: {
        userId,
        topic,
        difficulty: difficulty || 'medium',
        status: 'active',
        startedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error('Error creating practice session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create practice session',
      error: error.message
    });
  }
};

// Get practice session details
exports.getPracticeSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await prisma.practiceSessions.findFirst({
      where: {
        id: sessionId,
        userId
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Practice session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error('Error fetching practice session details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch practice session details',
      error: error.message
    });
  }
};

// Submit practice answer
exports.submitPracticeAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const { answer, questionId } = req.body;

    if (!answer || !questionId) {
      return res.status(400).json({
        success: false,
        message: 'Answer and questionId are required'
      });
    }

    // Verify session belongs to user
    const session = await prisma.practiceSessions.findFirst({
      where: {
        id: sessionId,
        userId
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Practice session not found'
      });
    }

    res.json({
      success: true,
      message: 'Answer submitted successfully'
    });
  } catch (error) {
    logger.error('Error submitting practice answer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit practice answer',
      error: error.message
    });
  }
};

// End practice session
exports.endPracticeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await prisma.practiceSessions.findFirst({
      where: {
        id: sessionId,
        userId
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Practice session not found'
      });
    }

    const updatedSession = await prisma.practiceSessions.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        endedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    logger.error('Error ending practice session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end practice session',
      error: error.message
    });
  }
};

// Get practice statistics
exports.getPracticeStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await prisma.practiceSessions.aggregate({
      where: { userId },
      _count: true
    });

    res.json({
      success: true,
      data: {
        totalSessions: stats._count
      }
    });
  } catch (error) {
    logger.error('Error fetching practice stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch practice statistics',
      error: error.message
    });
  }
};
