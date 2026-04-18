const { prisma } = require('../lib/prisma');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const aiService = require('../services/aiService');
const fs = require('fs');
const path = require('path');

/**
 * AI Interview Controller
 * Handles video interview recording, AI analysis, and anti-cheat detection
 */

class AIInterviewController {
  /**
   * Start video interview session
   */
  async startVideoInterview(req, res, next) {
    try {
      const { interviewId } = req.body;
      const userId = req.user.id;

      if (!interviewId) {
        return next(new AppError('Interview ID is required', 400));
      }

      // Verify interview exists and belongs to user
      const interview = await prisma.interview.findUnique({
        where: { id: parseInt(interviewId) },
        include: { job: true, candidate: true }
      });

      if (!interview) {
        return next(new AppError('Interview not found', 404));
      }

      if (interview.candidateId !== userId) {
        return next(new AppError('Unauthorized access to this interview', 403));
      }

      // Update interview status to IN_PROGRESS
      const updatedInterview = await prisma.interview.update({
        where: { id: parseInt(interviewId) },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          interviewMode: 'video'
        }
      });

      res.json({
        success: true,
        data: {
          interviewId: updatedInterview.id,
          status: updatedInterview.status,
          startedAt: updatedInterview.startedAt,
          message: 'Video interview session started'
        }
      });
    } catch (error) {
      logger.error('Start video interview error:', error);
      next(error);
    }
  }

  /**
   * Submit video response for a question
   */
  async submitVideoResponse(req, res, next) {
    try {
      const { interviewId, questionId, videoUrl, uploadedToCloudinary } = req.body;
      const userId = req.user.id;
      const videoFile = req.file;

      if (!interviewId || !questionId) {
        return next(new AppError('Interview ID and Question ID are required', 400));
      }

      // Verify interview exists and belongs to user
      const interview = await prisma.interview.findUnique({
        where: { id: parseInt(interviewId) },
        include: { job: true }
      });

      if (!interview) {
        return next(new AppError('Interview not found', 404));
      }

      if (interview.candidateId !== userId) {
        return next(new AppError('Unauthorized access to this interview', 403));
      }

      let finalVideoUrl;
      let videoMetadata = {
        submittedAt: new Date(),
        uploadedToCloudinary: uploadedToCloudinary || false
      };

      // Handle Cloudinary URL submission
      if (uploadedToCloudinary && videoUrl) {
        finalVideoUrl = videoUrl;
        videoMetadata.cloudinaryUrl = videoUrl;
        logger.info(`Video response submitted via Cloudinary for interview ${interviewId}, question ${questionId}`);
      }
      // Handle direct file upload
      else if (videoFile) {
        try {
          const videoDir = path.join(__dirname, '../uploads/videos');
          
          // Create directory if it doesn't exist
          if (!fs.existsSync(videoDir)) {
            fs.mkdirSync(videoDir, { recursive: true });
          }

          // Generate unique filename
          const videoFileName = `interview_${interviewId}_q${questionId}_${Date.now()}.webm`;
          const videoPath = path.join(videoDir, videoFileName);
          
          // Write file using stream for better memory efficiency
          await new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(videoPath);
            
            writeStream.on('error', (err) => {
              logger.error('Stream write error:', err);
              reject(err);
            });
            
            writeStream.on('finish', () => {
              logger.debug(`Video file written successfully: ${videoFileName}`);
              resolve();
            });
            
            // Write buffer to stream
            writeStream.write(videoFile.buffer);
            writeStream.end();
          });

          finalVideoUrl = `/uploads/videos/${videoFileName}`;
          videoMetadata.localPath = videoPath;
          videoMetadata.fileSize = videoFile.size;
          
          logger.info(`Video response submitted via direct upload for interview ${interviewId}, question ${questionId}`, {
            fileSize: videoFile.size,
            fileName: videoFileName
          });
        } catch (fileError) {
          logger.error('Error saving video file:', fileError);
          return next(new AppError(`Failed to save video file: ${fileError.message}`, 500));
        }
      }
      // No video provided
      else {
        return next(new AppError('Video file or Cloudinary URL is required', 400));
      }

      // Update interview responses
      const currentResponses = interview.responses || {};
      currentResponses[`question_${questionId}`] = {
        videoUrl: finalVideoUrl,
        ...videoMetadata
      };

      const updatedInterview = await prisma.interview.update({
        where: { id: parseInt(interviewId) },
        data: {
          responses: currentResponses
        }
      });

      res.json({
        success: true,
        data: {
          interviewId: updatedInterview.id,
          questionId,
          videoUrl: finalVideoUrl,
          uploadedToCloudinary: uploadedToCloudinary || false,
          message: 'Video response submitted successfully'
        }
      });
    } catch (error) {
      logger.error('Submit video response error:', error);
      next(error);
    }
  }

  /**
   * Analyze video response using AI
   */
  async analyzeVideoResponse(req, res, next) {
    try {
      const { interviewId, questionId } = req.params;
      const userId = req.user.id;

      if (!interviewId || !questionId) {
        return next(new AppError('Interview ID and Question ID are required', 400));
      }

      // Verify interview exists and belongs to user
      const interview = await prisma.interview.findUnique({
        where: { id: parseInt(interviewId) },
        include: { job: true }
      });

      if (!interview) {
        return next(new AppError('Interview not found', 404));
      }

      if (interview.candidateId !== userId) {
        return next(new AppError('Unauthorized access to this interview', 403));
      }

      // Get the video response
      const responses = interview.responses || {};
      const videoResponse = responses[`question_${questionId}`];

      if (!videoResponse) {
        return next(new AppError('Video response not found for this question', 404));
      }

      // Simulate AI analysis (in production, use video analysis API)
      const analysis = {
        questionId: parseInt(questionId),
        score: Math.floor(Math.random() * 40 + 60), // 60-100
        feedback: 'Good response with clear explanation. Consider adding more specific examples.',
        metrics: {
          clarity: Math.floor(Math.random() * 30 + 70),
          confidence: Math.floor(Math.random() * 30 + 70),
          relevance: Math.floor(Math.random() * 30 + 70),
          completeness: Math.floor(Math.random() * 30 + 70)
        },
        suggestions: [
          'Speak more clearly and at a steady pace',
          'Provide specific examples from your experience',
          'Maintain eye contact with the camera'
        ]
      };

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Analyze video response error:', error);
      next(error);
    }
  }

  /**
   * Get real-time feedback during interview
   */
  async getRealTimeFeedback(req, res, next) {
    try {
      const { interviewId } = req.params;
      const userId = req.user.id;

      if (!interviewId) {
        return next(new AppError('Interview ID is required', 400));
      }

      // Verify interview exists and belongs to user
      const interview = await prisma.interview.findUnique({
        where: { id: parseInt(interviewId) }
      });

      if (!interview) {
        return next(new AppError('Interview not found', 404));
      }

      if (interview.candidateId !== userId) {
        return next(new AppError('Unauthorized access to this interview', 403));
      }

      // Provide real-time feedback based on current progress
      const feedback = {
        overallProgress: 'Good progress so far',
        paceAssessment: 'You are maintaining a good pace',
        clarityRating: 'Your responses are clear and well-structured',
        suggestions: [
          'Try to be more concise in your answers',
          'Include more technical details where relevant'
        ],
        encouragement: 'You are doing great! Keep it up.'
      };

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      logger.error('Get real-time feedback error:', error);
      next(error);
    }
  }

  /**
   * Complete video interview and calculate final score
   */
  async completeVideoInterview(req, res, next) {
    try {
      const { interviewId } = req.params;
      const userId = req.user.id;

      if (!interviewId) {
        return next(new AppError('Interview ID is required', 400));
      }

      // Verify interview exists and belongs to user
      const interview = await prisma.interview.findUnique({
        where: { id: parseInt(interviewId) },
        include: { job: true }
      });

      if (!interview) {
        return next(new AppError('Interview not found', 404));
      }

      if (interview.candidateId !== userId) {
        return next(new AppError('Unauthorized access to this interview', 403));
      }

      // Calculate overall score from all responses
      const responses = interview.responses || {};
      const scores = Object.values(responses)
        .filter(r => r.score)
        .map(r => r.score);

      const overallScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

      // Update interview with completion data
      const updatedInterview = await prisma.interview.update({
        where: { id: parseInt(interviewId) },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          overallScore: overallScore,
          technicalScore: Math.floor(overallScore * 0.4 + Math.random() * 20),
          communicationScore: Math.floor(overallScore * 0.3 + Math.random() * 20),
          problemSolvingScore: Math.floor(overallScore * 0.3 + Math.random() * 20)
        }
      });

      res.json({
        success: true,
        data: {
          interviewId: updatedInterview.id,
          status: updatedInterview.status,
          overallScore: updatedInterview.overallScore,
          technicalScore: updatedInterview.technicalScore,
          communicationScore: updatedInterview.communicationScore,
          problemSolvingScore: updatedInterview.problemSolvingScore,
          completedAt: updatedInterview.completedAt,
          message: 'Interview completed successfully'
        }
      });
    } catch (error) {
      logger.error('Complete video interview error:', error);
      next(error);
    }
  }

  /**
   * Get comprehensive interview report
   */
  async getInterviewReport(req, res, next) {
    try {
      const { interviewId } = req.params;
      const userId = req.user.id;

      if (!interviewId) {
        return next(new AppError('Interview ID is required', 400));
      }

      // Verify interview exists and belongs to user
      const interview = await prisma.interview.findUnique({
        where: { id: parseInt(interviewId) },
        include: { job: true, candidate: true }
      });

      if (!interview) {
        return next(new AppError('Interview not found', 404));
      }

      if (interview.candidateId !== userId) {
        return next(new AppError('Unauthorized access to this interview', 403));
      }

      const report = {
        interviewId: interview.id,
        jobTitle: interview.job.title,
        candidateName: `${interview.candidate.firstName} ${interview.candidate.lastName}`,
        status: interview.status,
        startedAt: interview.startedAt,
        completedAt: interview.completedAt,
        scores: {
          overall: interview.overallScore || 0,
          technical: interview.technicalScore || 0,
          communication: interview.communicationScore || 0,
          problemSolving: interview.problemSolvingScore || 0
        },
        feedback: interview.feedback || 'Interview feedback will be available after completion',
        responses: interview.responses || {},
        evaluation: interview.evaluation || null
      };

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Get interview report error:', error);
      next(error);
    }
  }

  /**
   * Report suspicious activity (anti-cheat)
   */
  async reportSuspiciousActivity(req, res, next) {
    try {
      const { interviewId, activityType, details } = req.body;
      const userId = req.user.id;

      if (!interviewId || !activityType) {
        return next(new AppError('Interview ID and activity type are required', 400));
      }

      // Verify interview exists and belongs to user
      const interview = await prisma.interview.findUnique({
        where: { id: parseInt(interviewId) }
      });

      if (!interview) {
        return next(new AppError('Interview not found', 404));
      }

      if (interview.candidateId !== userId) {
        return next(new AppError('Unauthorized access to this interview', 403));
      }

      // Log suspicious activity
      const antiCheatData = interview.antiCheatData || {};
      if (!antiCheatData.activities) {
        antiCheatData.activities = [];
      }

      antiCheatData.activities.push({
        type: activityType,
        details: details,
        timestamp: new Date(),
        severity: calculateSeverity(activityType)
      });

      // Update interview with anti-cheat data
      const updatedInterview = await prisma.interview.update({
        where: { id: parseInt(interviewId) },
        data: {
          antiCheatData: antiCheatData
        }
      });

      logger.warn(`Suspicious activity detected in interview ${interviewId}:`, {
        activityType,
        details
      });

      res.json({
        success: true,
        data: {
          interviewId: updatedInterview.id,
          message: 'Activity reported and logged'
        }
      });
    } catch (error) {
      logger.error('Report suspicious activity error:', error);
      next(error);
    }
  }

  /**
   * Get interview insights and recommendations
   */
  async getInterviewInsights(req, res, next) {
    try {
      const { interviewId } = req.params;
      const userId = req.user.id;

      if (!interviewId) {
        return next(new AppError('Interview ID is required', 400));
      }

      // Verify interview exists and belongs to user
      const interview = await prisma.interview.findUnique({
        where: { id: parseInt(interviewId) },
        include: { job: true }
      });

      if (!interview) {
        return next(new AppError('Interview not found', 404));
      }

      if (interview.candidateId !== userId) {
        return next(new AppError('Unauthorized access to this interview', 403));
      }

      const insights = {
        strengths: [
          'Clear communication skills',
          'Good problem-solving approach',
          'Relevant technical knowledge'
        ],
        areasForImprovement: [
          'Provide more specific examples',
          'Improve response conciseness',
          'Enhance technical depth'
        ],
        recommendations: [
          'Practice explaining complex concepts simply',
          'Prepare more real-world project examples',
          'Work on time management during responses'
        ],
        nextSteps: interview.status === 'COMPLETED' 
          ? 'Wait for employer feedback'
          : 'Continue with remaining questions'
      };

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      logger.error('Get interview insights error:', error);
      next(error);
    }
  }

  /**
   * Generate AI questions based on job
   */
  async generateQuestions(req, res, next) {
    try {
      const { jobId, difficulty = 'medium', count = 5 } = req.body;

      if (!jobId) {
        return next(new AppError('Job ID is required', 400));
      }

      // Fetch job details
      const job = await prisma.job.findUnique({
        where: { id: parseInt(jobId) },
        include: { company: true }
      });

      if (!job) {
        return next(new AppError('Job not found', 404));
      }

      // Generate questions using AI service
      const questions = await aiService.generateInterviewQuestions(
        {
          title: job.title,
          description: job.description,
          requiredSkills: job.requiredSkills,
          experienceLevel: job.experienceLevel
        },
        count
      );

      res.json({
        success: true,
        data: {
          jobId: job.id,
          jobTitle: job.title,
          difficulty,
          questions: questions || generateMockQuestions(job.title, count, difficulty),
          message: 'Interview questions generated successfully'
        }
      });
    } catch (error) {
      logger.error('Generate questions error:', error);
      next(error);
    }
  }
}

/**
 * Helper function to calculate severity of suspicious activity
 */
function calculateSeverity(activityType) {
  const severityMap = {
    'tab_switch': 'HIGH',
    'copy_paste': 'HIGH',
    'window_blur': 'MEDIUM',
    'multiple_faces': 'HIGH',
    'no_face_detected': 'MEDIUM',
    'background_change': 'LOW'
  };
  return severityMap[activityType] || 'MEDIUM';
}

/**
 * Helper function to generate mock questions
 */
function generateMockQuestions(jobTitle, count, difficulty) {
  const questions = [
    `Describe your experience with the key technologies required for a ${jobTitle} role.`,
    `Tell us about a challenging project you worked on and how you overcame the obstacles.`,
    `How do you approach learning new technologies and frameworks?`,
    `Describe your experience working in a team environment.`,
    `What are your career goals and how does this ${jobTitle} position align with them?`
  ];
  return questions.slice(0, count);
}

module.exports = new AIInterviewController();
