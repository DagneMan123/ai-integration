const Interview = require('../models/Interview');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { generateInterviewQuestions, evaluateAnswer, generateReport } = require('../services/aiService');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

// Start interview
exports.startInterview = async (req, res, next) => {
  try {
    const { jobId, applicationId } = req.body;

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    // Check if application exists
    const application = await Application.findById(applicationId);
    if (!application || application.candidateId.toString() !== req.user.id) {
      return next(new AppError('Application not found', 404));
    }

    // Check if interview already exists
    const existingInterview = await Interview.findOne({
      applicationId,
      status: { $in: ['in_progress', 'completed'] }
    });

    if (existingInterview) {
      return next(new AppError('Interview already exists for this application', 400));
    }

    // Generate AI questions
    const questions = await generateInterviewQuestions(job);

    // Create interview
    const interview = await Interview.create({
      jobId,
      candidateId: req.user.id,
      applicationId,
      questions,
      status: 'in_progress',
      startedAt: new Date(),
      timeLimit: job.interviewConfig?.timeLimit || 60,
      currentQuestionIndex: 0
    });

    // Update application status
    application.status = 'interviewing';
    await application.save();

    logger.info(`Interview started: ${interview._id} for job ${jobId}`);

    res.status(201).json({
      success: true,
      data: {
        interviewId: interview._id,
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
    const { questionIndex, answer, timeTaken } = req.body;

    const interview = await Interview.findById(id);

    if (!interview) {
      return next(new AppError('Interview not found', 404));
    }

    if (interview.candidateId.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    if (interview.status !== 'in_progress') {
      return next(new AppError('Interview is not in progress', 400));
    }

    // Check for cheating behavior
    const { tabSwitches, suspiciousActivity } = req.body;
    if (tabSwitches) {
      interview.antiCheatData.tabSwitches += tabSwitches;
    }
    if (suspiciousActivity) {
      interview.antiCheatData.suspiciousActivities.push({
        type: suspiciousActivity.type,
        timestamp: new Date(),
        details: suspiciousActivity.details
      });
    }

    // Evaluate answer using AI
    const question = interview.questions[questionIndex];
    const evaluation = await evaluateAnswer(question, answer);

    // Store response
    interview.responses.push({
      questionIndex,
      question: question.text,
      answer,
      timeTaken,
      score: evaluation.score,
      feedback: evaluation.feedback
    });

    // Move to next question
    interview.currentQuestionIndex = questionIndex + 1;

    await interview.save();

    res.json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        nextQuestion: interview.questions[interview.currentQuestionIndex],
        isLastQuestion: interview.currentQuestionIndex >= interview.questions.length
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

    const interview = await Interview.findById(id).populate('jobId');

    if (!interview) {
      return next(new AppError('Interview not found', 404));
    }

    if (interview.candidateId.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    if (interview.status !== 'in_progress') {
      return next(new AppError('Interview is not in progress', 400));
    }

    // Generate AI evaluation report
    const report = await generateReport(interview);

    // Update interview
    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.aiEvaluation = report;
    await interview.save();

    // Update application
    const application = await Application.findById(interview.applicationId);
    if (application) {
      application.status = 'interviewed';
      application.interviewScore = report.overallScore;
      await application.save();
    }

    logger.info(`Interview completed: ${interview._id}`);

    res.json({
      success: true,
      message: 'Interview completed successfully',
      data: {
        interviewId: interview._id,
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
    const interviews = await Interview.find({ candidateId: req.user.id })
      .populate('jobId', 'title company')
      .sort('-createdAt')
      .lean();

    res.json({
      success: true,
      data: interviews
    });
  } catch (error) {
    next(error);
  }
};

// Get interview report
exports.getInterviewReport = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('jobId', 'title')
      .populate('candidateId', 'firstName lastName email');

    if (!interview) {
      return next(new AppError('Interview not found', 404));
    }

    // Check authorization
    if (
      interview.candidateId._id.toString() !== req.user.id &&
      req.user.role !== 'employer' &&
      req.user.role !== 'admin'
    ) {
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

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    // Check ownership
    if (job.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    const interviews = await Interview.find({ jobId })
      .populate('candidateId', 'firstName lastName email')
      .sort('-createdAt')
      .lean();

    res.json({
      success: true,
      data: interviews
    });
  } catch (error) {
    next(error);
  }
};

// Evaluate interview (employer)
exports.evaluateInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employerNotes, employerRating, decision } = req.body;

    const interview = await Interview.findById(id).populate('jobId');

    if (!interview) {
      return next(new AppError('Interview not found', 404));
    }

    // Check authorization
    if (interview.jobId.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    interview.employerEvaluation = {
      notes: employerNotes,
      rating: employerRating,
      decision,
      evaluatedBy: req.user.id,
      evaluatedAt: new Date()
    };

    await interview.save();

    // Update application
    if (decision) {
      const application = await Application.findById(interview.applicationId);
      if (application) {
        application.status = decision === 'accept' ? 'accepted' : 'rejected';
        await application.save();
      }
    }

    res.json({
      success: true,
      message: 'Interview evaluated successfully',
      data: interview
    });
  } catch (error) {
    next(error);
  }
};

// Get all interviews (admin)
exports.getAllInterviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const interviews = await Interview.find()
      .populate('candidateId', 'firstName lastName email')
      .populate('jobId', 'title')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Interview.countDocuments();

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
