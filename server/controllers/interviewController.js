const { prisma } = require('../config/database');
const enhancedAI = require('../services/enhancedAIService');
const antiCheatService = require('../services/antiCheatService');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

// 1. Start Interview (Modified with 5 ETB Credit Logic)
exports.startInterview = async (req, res, next) => {
  try {
    const { jobId, applicationId, interviewMode = 'text', strictnessLevel = 'moderate' } = req.body;
    const userId = req.user.id;

    // A. Check if user has sufficient credits (The 5 ETB Check)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.credits < 1) {
      return res.status(402).json({
        success: false,
        message: "Insufficient credits. Please top up 5 ETB to start this interview.",
        requiresTopUp: true
      });
    }

    // B. Verify job and application
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return next(new AppError('Job not found', 404));

    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application || application.candidateId !== userId) {
      return next(new AppError('Application not authorized', 403));
    }

    // C. Check if interview already exists
    const existingInterview = await prisma.interview.findFirst({
      where: { applicationId, status: { in: ['IN_PROGRESS', 'COMPLETED'] } }
    });
    if (existingInterview) return next(new AppError('Interview already in progress or completed', 400));

    // D. Deduct 1 Credit (5 ETB) and Start Interview in a Transaction
    const [updatedUser, questions, interview] = await prisma.$transaction([
      // Deduct credit
      prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: 1 } }
      }),
      // Generate AI questions
      enhancedAI.generateInterviewQuestions(job, strictnessLevel, 10),
      // Create record
      prisma.interview.create({
        data: {
          jobId,
          candidateId: userId,
          applicationId,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          interviewMode,
          strictnessLevel,
          questions: [], // Will be updated below
          antiCheatData: { tabSwitches: 0, copyPasteAttempts: 0, suspiciousActivities: [] },
          identityVerification: { snapshots: [], verified: false }
        }
      })
    ]);

    // Update interview with generated questions
    const finalInterview = await prisma.interview.update({
      where: { id: interview.id },
      data: { questions: questions }
    });

    antiCheatService.initializeSession(applicationId, userId);

    res.status(201).json({
      success: true,
      data: {
        interviewId: finalInterview.id,
        currentQuestion: questions[0],
        remainingCredits: updatedUser.credits
      }
    });
  } catch (error) {
    logger.error('Start Interview Error:', error);
    next(error);
  }
};

// 2. Submit Answer (Turn-by-turn with AI)
exports.submitAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionIndex, answer, timeTaken, audioTranscript } = req.body;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { job: true }
    });

    if (!interview || interview.status !== 'IN_PROGRESS') {
      return next(new AppError('Active interview session not found', 404));
    }

    const textToEvaluate = audioTranscript || answer;
    const currentQuestion = interview.questions[questionIndex];

    // Perform AI Checks concurrently
    const [evaluation, followUp, plagiarism] = await Promise.all([
      enhancedAI.evaluateAnswer(currentQuestion, textToEvaluate, interview.job, interview.strictnessLevel),
      enhancedAI.generateFollowUpQuestion(currentQuestion.question, textToEvaluate, interview.job),
      enhancedAI.detectAIContent(textToEvaluate)
    ]);

    const responses = interview.responses || [];
    responses.push({
      questionIndex,
      question: currentQuestion.question,
      answer: textToEvaluate,
      score: evaluation.score,
      feedback: evaluation.feedback,
      isAI: plagiarism.isAIGenerated,
      followUp: followUp?.followUp || null
    });

    // Update DB
    await prisma.interview.update({
      where: { id },
      data: { responses }
    });

    res.json({
      success: true,
      data: {
        nextQuestion: followUp?.followUp ? { question: followUp.followUp, type: 'follow-up' } : interview.questions[questionIndex + 1],
        isLastQuestion: !followUp?.followUp && questionIndex + 1 >= interview.questions.length,
        score: evaluation.score
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. Record Anti-Cheat Event
exports.recordAntiCheatEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { eventType, data } = req.body;

    // Use JSONB update in Prisma for performance
    const interview = await prisma.interview.findUnique({ where: { id } });
    if (!interview) return next(new AppError('Interview not found', 404));

    const antiCheatData = interview.antiCheatData || {};
    if (eventType === 'TAB_SWITCH') antiCheatData.tabSwitches = (antiCheatData.tabSwitches || 0) + 1;
    if (eventType === 'COPY_PASTE') antiCheatData.copyPasteAttempts = (antiCheatData.copyPasteAttempts || 0) + 1;
    
    antiCheatData.suspiciousActivities.push({
      type: eventType,
      timestamp: new Date(),
      metadata: data
    });

    await prisma.interview.update({
      where: { id },
      data: { antiCheatData }
    });

    res.json({ success: true, message: 'Event logged' });
  } catch (error) {
    next(error);
  }
};

// 4. Complete Interview & Final Report
exports.completeInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interview = await prisma.interview.findUnique({ 
        where: { id },
        include: { job: true } 
    });

    const report = await enhancedAI.generateComprehensiveReport(interview);
    const integrity = antiCheatService.calculateIntegrityScore(id);

    await prisma.$transaction([
      prisma.interview.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          overallScore: report.overallScore,
          evaluation: report, // Matches your schema
          integrityScore: integrity.score,
          integrityRisk: integrity.riskLevel
        }
      }),
      prisma.application.update({
        where: { id: interview.applicationId },
        data: { status: 'INTERVIEWED' }
      })
    ]);

    antiCheatService.endSession(id);

    res.json({
      success: true,
      data: { overallScore: report.overallScore, integrityScore: integrity.score }
    });
  } catch (error) {
    next(error);
  }
};

// 5. Results for Candidate
exports.getCandidateResults = async (req, res, next) => {
  try {
    const results = await prisma.interview.findMany({
      where: { candidateId: req.user.id, status: 'COMPLETED' },
      include: { job: { include: { company: true } } },
      orderBy: { completedAt: 'desc' }
    });

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};


// 6. Get Employer Interviews (for calendar view)
exports.getEmployerInterviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const interviews = await prisma.interview.findMany({
      where: {
        job: {
          createdBy: userId
        }
      },
      include: {
        job: true,
        application: {
          include: {
            candidate: true
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    res.json({ success: true, data: interviews });
  } catch (error) {
    next(error);
  }
};

// 7. Get Candidate Interviews
exports.getCandidateInterviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const interviews = await prisma.interview.findMany({
      where: { candidateId: userId },
      include: {
        job: {
          include: { company: true }
        },
        application: true
      },
      orderBy: { startedAt: 'desc' }
    });

    res.json({ success: true, data: interviews });
  } catch (error) {
    next(error);
  }
};

// 8. Get Interview Report
exports.getInterviewReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        job: true,
        application: {
          include: { candidate: true }
        }
      }
    });

    if (!interview) {
      return next(new AppError('Interview not found', 404));
    }

    res.json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

// 9. Record Identity Snapshot
exports.recordIdentitySnapshot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageData, timestamp } = req.body;

    const interview = await prisma.interview.findUnique({ where: { id } });
    if (!interview) {
      return next(new AppError('Interview not found', 404));
    }

    const identityVerification = interview.identityVerification || { snapshots: [], verified: false };
    identityVerification.snapshots.push({
      imageData,
      timestamp: new Date(timestamp),
      verified: false
    });

    await prisma.interview.update({
      where: { id },
      data: { identityVerification }
    });

    res.json({ success: true, message: 'Identity snapshot recorded' });
  } catch (error) {
    next(error);
  }
};

// 10. Get Integrity Report
exports.getIntegrityReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interview = await prisma.interview.findUnique({ where: { id } });

    if (!interview) {
      return next(new AppError('Interview not found', 404));
    }

    const integrityScore = antiCheatService.calculateIntegrityScore(id);

    res.json({
      success: true,
      data: {
        integrityScore: interview.integrityScore || 0,
        integrityRisk: interview.integrityRisk || 'LOW',
        antiCheatData: interview.antiCheatData,
        identityVerification: interview.identityVerification
      }
    });
  } catch (error) {
    next(error);
  }
};

// 11. Get Job Interviews
exports.getJobInterviews = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const interviews = await prisma.interview.findMany({
      where: { jobId },
      include: {
        application: {
          include: { candidate: true }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    res.json({ success: true, data: interviews });
  } catch (error) {
    next(error);
  }
};

// 12. Evaluate Interview (Employer)
exports.evaluateInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { score, feedback, recommendation } = req.body;

    const interview = await prisma.interview.findUnique({ where: { id } });
    if (!interview) {
      return next(new AppError('Interview not found', 404));
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: {
        employerEvaluation: {
          score,
          feedback,
          recommendation,
          evaluatedAt: new Date()
        }
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// 13. Get All Interviews (Admin)
exports.getAllInterviews = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const interviews = await prisma.interview.findMany({
      include: {
        job: true,
        application: {
          include: { candidate: true }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.interview.count();

    res.json({
      success: true,
      data: interviews,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
};
