const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { authenticateToken } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

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
    const { jobDetails, questionCount = 10 } = req.body;

    if (!jobDetails) {
      return next(new AppError('Job details are required', 400));
    }

    const questions = await aiService.generateInterviewQuestions(jobDetails, questionCount);

    res.json({
      success: true,
      data: questions,
      message: 'Interview questions generated successfully'
    });
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

module.exports = router;
