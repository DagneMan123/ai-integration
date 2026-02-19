const prisma = require('../lib/prisma');
const { generateInterviewQuestions, evaluateAnswer, generateReport } = require('../services/aiService');
const enhancedAI = require('../services/enhancedAIService');
const antiCheatService = require('../services/antiCheatService');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

// Start interview
exports.startInterview = async (req, res, next) => {
  try {
    const { jobId, applicationId, interviewMode = 'text', strictnessLevel = 'moderate' } = req.body;

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });
    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    // Check if application exists and belongs to the candidate
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!application || application.candidateId !== req.user.id) {
      return next(new AppError('Application not found', 404));
    }

    // Check if interview already exists
    const existingInterview = await prisma.interview.findFirst({
      where: {
        applicationId,
        status: { in: ['IN_PROGRESS', 'COMPLETED'] }
      }
    });

    if (existingInterview) {
      return next(new AppError('Interview already exists for this application', 400));
    }

    // Generate AI questions using enhanced service
    const questions = await enhancedAI.generateInterviewQuestions(job, strictnessLevel, 10);

    // Initialize anti-cheat session
    antiCheatService.initializeSession(applicationId, req.user.id);

    // Create interview
    const interview = await prisma.interview.create({
      data: {
        jobId,
        candidateId: req.user.id,
        applicationId,
        questions: questions,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        interviewMode,
        strictnessLevel,
        antiCheatData: { 
          tabSwitches: 0, 
          copyPasteAttempts: 0,
          suspiciousActivities: [],
          browserFingerprint: null
        },
        identityVerification: {
          snapshots: [],
          verified: false
        }
      }
    });

    // Update application status
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'INTERVIEW_SCHEDULED' }
    });

    logger.info(`Interview started: ${interview.id} for job ${jobId} in ${interviewMode} mode`);

    res.status(201).json({
      success: true,
      data: {
        interviewId: interview.id,
        questions: interview.questions,
        interviewMode,
        strictnessLevel,
        currentQuestion: interview.questions[0],
        requiresIdentityVerification: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// Submit answer
exports.submitAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionIndex, answer, timeTaken, audioTranscript, audioDuration } = req.body;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { job: true }
    });

    if (!interview) {
      return next(new AppError('Interview not found', 404));
    }

    if (interview.candidateId !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    if (interview.status !== 'IN_PROGRESS') {
      return next(new AppError('Interview is not in progress', 400));
    }

    const questions = interview.questions;
    const question = questions[questionIndex];
    const textToEvaluate = audioTranscript || answer;

    // AI Plagiarism Detection
    const plagiarismCheck = await enhancedAI.detectAIContent(textToEvaluate);

    // Speech Analysis (if audio mode)
    let speechAnalysis = null;
    if (interview.interviewMode === 'audio' && audioTranscript) {
      speechAnalysis = enhancedAI.analyzeSpeechPatterns(audioTranscript, audioDuration);
    }

    // Sentiment Analysis
    const sentimentAnalysis = await enhancedAI.analyzeSentiment(textToEvaluate);

    // Evaluate answer using enhanced AI
    const evaluation = await enhancedAI.evaluateAnswer(
      question,
      textToEvaluate,
      interview.job,
      interview.strictnessLevel
    );

    // Check if follow-up is needed
    const followUp = await enhancedAI.generateFollowUpQuestion(
      question.question,
      textToEvaluate,
      interview.job
    );

    // Prepare responses array
    const responses = interview.responses || [];
    responses.push({
      questionIndex,
      question: question.question,
      answer: textToEvaluate,
      timeTaken,
      score: evaluation.score,
      feedback: evaluation.feedback,
      plagiarismCheck,
      speechAnalysis,
      sentimentAnalysis,
      followUp: followUp ? followUp.followUp : null
    });

    // Update behavioral and confidence metrics
    const behavioralMetrics = interview.behavioralMetrics || {};
    const confidenceMetrics = interview.confidenceMetrics || {};

    if (speechAnalysis) {
      behavioralMetrics.avgSpeechRate = (behavioralMetrics.avgSpeechRate || 0) + speechAnalysis.speechRate;
      behavioralMetrics.totalFillers = (behavioralMetrics.totalFillers || 0) + speechAnalysis.fillerCount;
      confidenceMetrics.avgFluency = (confidenceMetrics.avgFluency || 0) + speechAnalysis.fluencyScore;
    }

    if (sentimentAnalysis) {
      behavioralMetrics.avgSentiment = (behavioralMetrics.avgSentiment || 0) + sentimentAnalysis.sentimentScore;
      confidenceMetrics.avgProfessionalism = (confidenceMetrics.avgProfessionalism || 0) + sentimentAnalysis.professionalismScore;
    }

    // Update plagiarism flags
    const plagiarismFlags = interview.plagiarismFlags || { flaggedAnswers: [] };
    if (plagiarismCheck.isAIGenerated) {
      plagiarismFlags.flaggedAnswers.push({
        questionIndex,
        confidence: plagiarismCheck.confidence,
        indicators: plagiarismCheck.indicators,
        recommendation: plagiarismCheck.recommendation
      });
    }

    // Update interview record
    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: {
        responses,
        behavioralMetrics,
        confidenceMetrics,
        plagiarismFlags
      }
    });

    // Determine next question (could be follow-up or next in sequence)
    let nextQuestion = null;
    let isLastQuestion = false;

    if (followUp && followUp.followUp) {
      // Insert follow-up question
      nextQuestion = {
        id: `${questionIndex}-followup`,
        question: followUp.followUp,
        type: 'follow-up',
        reason: followUp.reason
      };
    } else if (questionIndex + 1 < questions.length) {
      nextQuestion = questions[questionIndex + 1];
    } else {
      isLastQuestion = true;
    }

    res.json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        nextQuestion,
        isLastQuestion,
        evaluation: {
          score: evaluation.score,
          feedback: evaluation.feedback
        },
        integrityWarning: plagiarismCheck.isAIGenerated ? plagiarismCheck.recommendation : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Complete interview
exports.completeInterview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { job: true }
    });

    if (!interview) {
      return next(new AppError('Interview not found', 404));
    }

    if (interview.candidateId !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    // Generate comprehensive AI report using enhanced service
    const report = await enhancedAI.generateComprehensiveReport(interview);

    // Calculate integrity score based on anti-cheat data
    const integrityAnalysis = antiCheatService.calculateIntegrityScore(id);

    // Update Interview and Application in a transaction
    await prisma.$transaction([
      prisma.interview.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          evaluation: report,
          overallScore: report.overallScore,
          technicalScore: report.technicalScore,
          communicationScore: report.communicationScore,
          problemSolvingScore: report.problemSolvingScore,
          softSkillsScore: report.softSkillsScore,
          confidenceScore: report.confidenceScore,
          fluencyScore: report.fluencyScore,
          professionalismScore: report.professionalismScore,
          integrityScore: integrityAnalysis.score,
          integrityRisk: integrityAnalysis.riskLevel
        }
      }),
      prisma.application.update({
        where: { id: interview.applicationId },
        data: {
          status: 'INTERVIEWED'
        }
      })
    ]);

    // Clean up anti-cheat session
    antiCheatService.endSession(id);

    logger.info(`Interview completed: ${id} with overall score ${report.overallScore}`);

    res.json({
      success: true,
      data: {
        interviewId: id,
        overallScore: report.overallScore,
        integrityScore: integrityAnalysis.score,
        integrityRisk: integrityAnalysis.riskLevel,
        reportAvailable: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// Record anti-cheat event
exports.recordAntiCheatEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { eventType, timestamp, data } = req.body;

    const interview = await prisma.interview.findUnique({
      where: { id }
    });

    if (!interview || interview.candidateId !== req.user.id) {
      return next(new AppError('Interview not found', 404));
    }

    // Record event in anti-cheat service
    switch (eventType) {
      case 'TAB_SWITCH':
        antiCheatService.recordTabSwitch(id, timestamp);
        break;
      case 'COPY_PASTE':
        antiCheatService.recordCopyPaste(id, timestamp, data.content);
        break;
      case 'WINDOW_BLUR':
        antiCheatService.recordWindowBlur(id, timestamp, data.duration);
        break;
      case 'BROWSER_FINGERPRINT':
        antiCheatService.recordBrowserFingerprint(id, data);
        break;
      default:
        return next(new AppError('Invalid event type', 400));
    }

    // Update interview anti-cheat data
    const session = antiCheatService.sessions.get(id);
    if (session) {
      await prisma.interview.update({
        where: { id },
        data: {
          antiCheatData: {
            tabSwitches: session.tabSwitches,
            copyPasteAttempts: session.copyPasteAttempts,
            suspiciousActivities: session.suspiciousActivities,
            browserFingerprint: session.browserFingerprint,
            events: session.events
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Event recorded',
      warning: session?.suspiciousActivities.length > 3 ? 'Multiple suspicious activities detected' : null
    });
  } catch (error) {
    next(error);
  }
};

// Record identity verification snapshot
exports.recordIdentitySnapshot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageData, faceDetected, confidence, metadata } = req.body;

    const interview = await prisma.interview.findUnique({
      where: { id }
    });

    if (!interview || interview.candidateId !== req.user.id) {
      return next(new AppError('Interview not found', 404));
    }

    // In production, upload imageData to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll store metadata only
    const snapshotData = {
      imageUrl: `snapshot_${id}_${Date.now()}`, // Placeholder
      faceDetected,
      confidence,
      metadata
    };

    antiCheatService.recordIdentitySnapshot(id, snapshotData);

    // Update interview identity verification
    const session = antiCheatService.sessions.get(id);
    if (session) {
      await prisma.interview.update({
        where: { id },
        data: {
          identityVerification: {
            snapshots: session.identitySnapshots,
            verified: session.identitySnapshots.every(s => s.faceDetected),
            lastVerified: new Date()
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Identity snapshot recorded',
      verified: faceDetected
    });
  } catch (error) {
    next(error);
  }
};

// Get integrity report
exports.getIntegrityReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        job: { select: { title: true, createdBy: true } }
      }
    });

    if (!interview) {
      return next(new AppError('Interview not found', 404));
    }

    // Authorization: candidate, employer, or admin
    const isOwner = interview.candidateId === req.user.id;
    const isEmployer = interview.job.createdBy === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isEmployer && !isAdmin) {
      return next(new AppError('Not authorized', 403));
    }

    const integrityReport = {
      integrityScore: interview.integrityScore,
      integrityRisk: interview.integrityRisk,
      antiCheatData: interview.antiCheatData,
      plagiarismFlags: interview.plagiarismFlags,
      identityVerification: interview.identityVerification,
      recommendations: []
    };

    // Add recommendations based on risk level
    if (interview.integrityRisk === 'HIGH') {
      integrityReport.recommendations.push('Manual review recommended');
      integrityReport.recommendations.push('Consider additional verification');
    } else if (interview.integrityRisk === 'MEDIUM') {
      integrityReport.recommendations.push('Review flagged activities');
    }

    res.json({
      success: true,
      data: integrityReport
    });
  } catch (error) {
    next(error);
  }
};

// Get candidate interviews
exports.getCandidateInterviews = async (req, res, next) => {
  try {
    const interviews = await prisma.interview.findMany({
      where: { candidateId: req.user.id },
      include: {
        job: { select: { title: true, company: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: interviews });
  } catch (error) {
    next(error);
  }
};

// Get interview report
exports.getInterviewReport = async (req, res, next) => {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: req.params.id },
      include: {
        job: { select: { title: true, createdBy: true } },
        candidate: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    if (!interview) return next(new AppError('Interview not found', 404));

    // Authorization check
    const isOwner = interview.candidateId === req.user.id;
    const isEmployer = interview.job.createdBy === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isEmployer && !isAdmin) {
      return next(new AppError('Not authorized', 403));
    }

    res.json({
      success: true,
      data: {
        interview,
        report: interview.aiEvaluation
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get job interviews (employer)
exports.getJobInterviews = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return next(new AppError('Job not found', 404));

    if (job.createdBy !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    const interviews = await prisma.interview.findMany({
      where: { jobId },
      include: {
        candidate: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: interviews });
  } catch (error) {
    next(error);
  }
};

// Evaluate interview (employer manual evaluation)
exports.evaluateInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employerNotes, employerRating, decision } = req.body;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { job: true }
    });

    if (!interview) return next(new AppError('Interview not found', 404));

    if (interview.job.createdBy !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: {
        employerEvaluation: {
          notes: employerNotes,
          rating: employerRating,
          decision,
          evaluatedBy: req.user.id,
          evaluatedAt: new Date()
        }
      }
    });

    if (decision) {
      await prisma.application.update({
        where: { id: interview.applicationId },
        data: { status: decision === 'accept' ? 'accepted' : 'rejected' }
      });
    }

    res.json({ success: true, data: updatedInterview });
  } catch (error) {
    next(error);
  }
};

// Get all interviews (admin)
exports.getAllInterviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [interviews, count] = await prisma.$transaction([
      prisma.interview.findMany({
        include: {
          candidate: { select: { firstName: true, lastName: true, email: true } },
          job: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: parseInt(limit)
      }),
      prisma.interview.count()
    ]);

    res.json({
      success: true,
      data: interviews,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};