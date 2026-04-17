/**
 * Interview Session Routes
 * Handles professional interview sessions with AI personas
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const interviewPersonaService = require('../services/interviewPersonaService');
const { logger } = require('../utils/logger');

/**
 * POST /api/interview-session/generate-questions
 * Generate interview questions for a job
 */
router.post('/generate-questions', authenticateToken, async (req, res) => {
  try {
    const { jobId, title, company, experienceLevel, requiredSkills } = req.body;

    if (!title || !company) {
      return res.status(400).json({
        success: false,
        message: 'Job title and company are required'
      });
    }

    const jobDetails = {
      jobId,
      title,
      company,
      experienceLevel: experienceLevel || 'mid-level',
      requiredSkills: requiredSkills || []
    };

    const questions = await interviewPersonaService.generateQuestions(jobDetails);

    res.json({
      success: true,
      data: questions,
      message: 'Questions generated successfully'
    });
  } catch (error) {
    logger.error('Error generating questions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate questions'
    });
  }
});

/**
 * POST /api/interview-session/evaluate-response
 * Evaluate a candidate's response
 */
router.post('/evaluate-response', authenticateToken, async (req, res) => {
  try {
    const { question, response, jobDetails } = req.body;

    if (!question || !response) {
      return res.status(400).json({
        success: false,
        message: 'Question and response are required'
      });
    }

    const evaluation = await interviewPersonaService.evaluateResponse(
      question,
      response,
      jobDetails
    );

    res.json({
      success: true,
      data: evaluation,
      message: 'Response evaluated successfully'
    });
  } catch (error) {
    logger.error('Error evaluating response:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to evaluate response'
    });
  }
});

/**
 * POST /api/interview-session/persona-response
 * Generate interviewer persona response
 */
router.post('/persona-response', authenticateToken, async (req, res) => {
  try {
    const { question, candidateResponse, evaluation } = req.body;

    if (!question || !candidateResponse || !evaluation) {
      return res.status(400).json({
        success: false,
        message: 'Question, response, and evaluation are required'
      });
    }

    const personaResponse = await interviewPersonaService.generatePersonaResponse(
      question,
      candidateResponse,
      evaluation
    );

    res.json({
      success: true,
      data: { response: personaResponse },
      message: 'Persona response generated successfully'
    });
  } catch (error) {
    logger.error('Error generating persona response:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate persona response'
    });
  }
});

/**
 * POST /api/interview-session/summary
 * Generate interview summary
 */
router.post('/summary', authenticateToken, async (req, res) => {
  try {
    const { responses, jobDetails } = req.body;

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Interview responses are required'
      });
    }

    const summary = await interviewPersonaService.generateInterviewSummary(
      responses,
      jobDetails
    );

    res.json({
      success: true,
      data: summary,
      message: 'Interview summary generated successfully'
    });
  } catch (error) {
    logger.error('Error generating summary:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate summary'
    });
  }
});

module.exports = router;
