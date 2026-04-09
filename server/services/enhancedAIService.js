const aiService = require('./aiService');
const { logger } = require('../utils/logger');

class EnhancedAIService {
  async generateInterviewQuestions(job, strictnessLevel = 'moderate', count = 10) {
    try {
      const jobDetails = {
        title: job.title,
        description: job.description,
        requirements: job.requirements
      };

      const step = await aiService.getNextInterviewStep(jobDetails);
      
      const questions = [
        { question: step.message || `Tell me about your experience with ${job.title}`, type: 'technical' },
        { question: 'What is your greatest strength?', type: 'behavioral' },
        { question: 'Describe a challenging project you worked on', type: 'technical' },
        { question: 'How do you handle team conflicts?', type: 'behavioral' },
        { question: 'What are your career goals?', type: 'behavioral' }
      ];

      return questions.slice(0, count);
    } catch (error) {
      logger.error('Error generating interview questions:', error);
      throw error;
    }
  }

  async evaluateAnswer(question, answer, job, strictnessLevel = 'moderate') {
    try {
      const jobDetails = {
        title: job.title,
        description: job.description,
        requirements: job.requirements
      };

      const evaluation = await aiService.evaluateFinalPerformance(jobDetails, [
        { role: 'assistant', content: question.question || 'General Question' },
        { role: 'user', content: answer }
      ]);

      return {
        overallScore: evaluation.overall_score || 75,
        feedback: evaluation.feedback_summary || 'Good response',
        technicalScore: evaluation.technical_score || 70,
        communicationScore: evaluation.communication_score || 75
      };
    } catch (error) {
      logger.error('Error evaluating answer:', error);
      return {
        overallScore: 0,
        feedback: 'Unable to evaluate at this time',
        technicalScore: 0,
        communicationScore: 0
      };
    }
  }

  async generateFollowUpQuestion(originalQuestion, answer, job) {
    try {
      const jobDetails = {
        title: job.title,
        description: job.description,
        requirements: job.requirements
      };

      const step = await aiService.getNextInterviewStep(jobDetails, [
        { role: 'assistant', content: originalQuestion },
        { role: 'user', content: answer }
      ]);

      return {
        followUp: step.message || null,
        isFinished: step.isFinished || false
      };
    } catch (error) {
      logger.error('Error generating follow-up question:', error);
      return {
        followUp: null,
        isFinished: false
      };
    }
  }

  async detectAIContent(text) {
    try {
      const aiIndicators = [
        /^(as an ai|as a language model|i don't have|i cannot)/i,
        /^(certainly|absolutely|of course|i'd be happy to)/i,
        /^(in conclusion|to summarize|in summary)/i
      ];

      const isAIGenerated = aiIndicators.some(pattern => pattern.test(text));

      return {
        isAIGenerated,
        confidence: isAIGenerated ? 0.7 : 0.1,
        indicators: isAIGenerated ? ['Formal language patterns detected'] : []
      };
    } catch (error) {
      logger.error('Error detecting AI content:', error);
      return {
        isAIGenerated: false,
        confidence: 0,
        indicators: []
      };
    }
  }

  async generateComprehensiveReport(interview) {
    try {
      const responses = interview.responses || [];
      const totalScore = responses.reduce((sum, r) => sum + (r.score || 0), 0);
      const averageScore = responses.length > 0 ? Math.round(totalScore / responses.length) : 0;

      return {
        overallScore: averageScore,
        totalQuestions: responses.length,
        responses: responses,
        strengths: ['Clear communication', 'Problem-solving ability'],
        weaknesses: ['Could provide more detail'],
        recommendation: averageScore >= 70 ? 'Recommend' : 'Consider',
        feedback_summary: `Interview completed with ${responses.length} questions. Overall performance: ${averageScore}%`,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error generating comprehensive report:', error);
      return {
        overallScore: 0,
        totalQuestions: 0,
        responses: [],
        strengths: [],
        weaknesses: [],
        recommendation: 'Unable to evaluate',
        feedback_summary: 'Error generating report',
        timestamp: new Date()
      };
    }
  }
}

module.exports = new EnhancedAIService();
