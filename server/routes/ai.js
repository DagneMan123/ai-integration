const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const aiInterviewController = require('../controllers/aiInterviewController');
const { authenticateToken } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { upload, uploadOptional } = require('../middleware/upload');

// Check AI service availability
router.get('/status', async (req, res, next) => {
  try {
    const status = await aiService.checkAvailability();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
});

// Generate interview questions
router.post('/generate-questions', authenticateToken, async (req, res, next) => {
  try {
    await aiInterviewController.generateQuestions(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Evaluate interview responses
router.post('/evaluate-responses', authenticateToken, async (req, res, next) => {
  try {
    const { questions, responses, jobDetails } = req.body;

    if (!questions || !responses || !jobDetails) {
      return next(new AppError('Questions, responses, and job details are required', 400));
    }

    const evaluation = await aiService.evaluateResponses(questions, responses, jobDetails);

    res.json({
      success: true,
      data: evaluation,
      message: 'Responses evaluated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Generate personalized feedback
router.post('/generate-feedback', authenticateToken, async (req, res, next) => {
  try {
    const { evaluation, candidateProfile } = req.body;

    if (!evaluation || !candidateProfile) {
      return next(new AppError('Evaluation and candidate profile are required', 400));
    }

    const feedback = await aiService.generateFeedback(evaluation, candidateProfile);

    res.json({
      success: true,
      data: feedback,
      message: 'Feedback generated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Analyze resume
router.post('/analyze-resume', authenticateToken, async (req, res, next) => {
  try {
    const { resumeText, jobRequirements } = req.body;

    if (!resumeText || !jobRequirements) {
      return next(new AppError('Resume text and job requirements are required', 400));
    }

    const analysis = await aiService.analyzeResume(resumeText, jobRequirements);

    res.json({
      success: true,
      data: analysis,
      message: 'Resume analyzed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Generate job recommendations
router.post('/job-recommendations', authenticateToken, async (req, res, next) => {
  try {
    const { candidateProfile, availableJobs } = req.body;

    if (!candidateProfile || !availableJobs) {
      return next(new AppError('Candidate profile and available jobs are required', 400));
    }

    const recommendations = await aiService.generateJobRecommendations(candidateProfile, availableJobs);

    res.json({
      success: true,
      data: recommendations,
      message: 'Job recommendations generated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Generate cover letter
router.post('/generate-cover-letter', authenticateToken, async (req, res, next) => {
  try {
    const { candidateProfile, jobDetails } = req.body;

    if (!candidateProfile || !jobDetails) {
      return next(new AppError('Candidate profile and job details are required', 400));
    }

    const coverLetter = await aiService.generateCoverLetter(candidateProfile, jobDetails);

    res.json({
      success: true,
      data: coverLetter,
      message: 'Cover letter generated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Analyze interview performance
router.post('/analyze-performance', authenticateToken, async (req, res, next) => {
  try {
    const { interviewData } = req.body;

    if (!interviewData) {
      return next(new AppError('Interview data is required', 400));
    }

    const analysis = await aiService.analyzeInterviewPerformance(interviewData);

    res.json({
      success: true,
      data: analysis,
      message: 'Interview performance analyzed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Generate skill development plan
router.post('/skill-development-plan', authenticateToken, async (req, res, next) => {
  try {
    const { candidateProfile, targetSkills } = req.body;

    if (!candidateProfile || !targetSkills || targetSkills.length === 0) {
      return next(new AppError('Candidate profile and target skills are required', 400));
    }

    const developmentPlan = await aiService.generateSkillDevelopmentPlan(candidateProfile, targetSkills);

    res.json({
      success: true,
      data: developmentPlan,
      message: 'Skill development plan generated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Chatbot conversation
router.post('/chat', async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const response = await aiService.chatWithAI(message, conversationHistory);

    res.json({
      success: true,
      data: {
        response: response,
        timestamp: new Date()
      },
      message: 'Chat response generated successfully'
    });
  } catch (error) {
    logger.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: error.message
    });
  }
});

// ============================================
// VIDEO INTERVIEW ROUTES
// ============================================

// Start video interview session
router.post('/video-interview/start', authenticateToken, async (req, res, next) => {
  try {
    await aiInterviewController.startVideoInterview(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Submit video response
router.post('/video-interview/submit-response', authenticateToken, uploadOptional, async (req, res, next) => {
  try {
    await aiInterviewController.submitVideoResponse(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Analyze video response
router.get('/video-interview/:interviewId/analysis/:questionId', authenticateToken, async (req, res, next) => {
  try {
    await aiInterviewController.analyzeVideoResponse(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Get real-time feedback
router.get('/video-interview/:interviewId/feedback', authenticateToken, async (req, res, next) => {
  try {
    await aiInterviewController.getRealTimeFeedback(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Complete video interview
router.post('/video-interview/:interviewId/complete', authenticateToken, async (req, res, next) => {
  try {
    await aiInterviewController.completeVideoInterview(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Get interview report
router.get('/video-interview/:interviewId/report', authenticateToken, async (req, res, next) => {
  try {
    await aiInterviewController.getInterviewReport(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Report suspicious activity (anti-cheat)
router.post('/anti-cheat/report', authenticateToken, async (req, res, next) => {
  try {
    await aiInterviewController.reportSuspiciousActivity(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Get interview insights
router.get('/interview/:interviewId/insights', authenticateToken, async (req, res, next) => {
  try {
    await aiInterviewController.getInterviewInsights(req, res, next);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
