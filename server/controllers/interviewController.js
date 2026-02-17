const prisma = require('../lib/prisma');
const { generateInterviewQuestions, evaluateAnswer, generateReport } = require('../services/aiService');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

// Start interview
exports.startInterview = async (req, res, next) => {
  try {
    const { jobId, applicationId } = req.body;

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
        status: { in: ['in_progress', 'completed'] }
      }
    });

    if (existingInterview) {
      return next(new AppError('Interview already exists for this application', 400));
    }

    // Generate AI questions (External Service)
    const questions = await generateInterviewQuestions(job);

    // Create interview
    const interview = await prisma.interview.create({
      data: {
        jobId,
        candidateId: req.user.id,
        applicationId,
        questions: questions, // Assuming this is a JSON field
        status: 'in_progress',
        startedAt: new Date(),
        timeLimit: job.interviewConfig?.timeLimit || 60,
        currentQuestionIndex: 0,
        antiCheatData: { tabSwitches: 0, suspiciousActivities: [] } // Initial JSON
      }
    });

    // Update application status
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'interviewing' }
    });

    logger.info(`Interview started: ${interview.id} for job ${jobId}`);

    res.status(201).json({
      success: true,
      data: {
        interviewId: interview.id,
        questions: interview.questions,
        timeLimit: interview.timeLimit,
        currentQuestion: interview.questions[0]
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
    const { questionIndex, answer, timeTaken, tabSwitches, suspiciousActivity } = req.body;

    const interview = await prisma.interview.findUnique({
      where: { id }
    });

    if (!interview) {
      return next(new AppError('Interview not found', 404));
    }

    if (interview.candidateId !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    if (interview.status !== 'in_progress') {
      return next(new AppError('Interview is not in progress', 400));
    }

    // Handle Anticheat Data (Prisma JSON update)
    let updatedAntiCheat = interview.antiCheatData || { tabSwitches: 0, suspiciousActivities: [] };
    if (tabSwitches) updatedAntiCheat.tabSwitches += tabSwitches;
    if (suspiciousActivity) {
      updatedAntiCheat.suspiciousActivities.push({
        type: suspiciousActivity.type,
        timestamp: new Date(),
        details: suspiciousActivity.details
      });
    }

    // Evaluate answer using AI
    const questions = interview.questions;
    const question = questions[questionIndex];
    const evaluation = await evaluateAnswer(question, answer);

    // Prepare responses array
    const responses = interview.responses || [];
    responses.push({
      questionIndex,
      question: question.text,
      answer,
      timeTaken,
      score: evaluation.score,
      feedback: evaluation.feedback
    });

    // Update interview record
    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: {
        responses,
        currentQuestionIndex: questionIndex + 1,
        antiCheatData: updatedAntiCheat
      }
    });

    res.json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        nextQuestion: updatedInterview.questions[updatedInterview.currentQuestionIndex],
        isLastQuestion: updatedInterview.currentQuestionIndex >= updatedInterview.questions.length
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

    // AI report generation
    const report = await generateReport(interview);

    // Update Interview and Application in a transaction
    await prisma.$transaction([
      prisma.interview.update({
        where: { id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          aiEvaluation: report
        }
      }),
      prisma.application.update({
        where: { id: interview.applicationId },
        data: {
          status: 'interviewed',
          interviewScore: report.overallScore
        }
      })
    ]);

    logger.info(`Interview completed: ${id}`);

    res.json({
      success: true,
      data: {
        interviewId: id,
        score: report.overallScore,
        reportAvailable: true
      }
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