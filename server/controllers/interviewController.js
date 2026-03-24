const prisma = require('../config/database');
const enhancedAI = require('../services/enhancedAIService');
const antiCheatService = require('../services/antiCheatService');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

// Helper: Credit Check logic to reuse
const checkAndDeductCredit = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.credits < 1) {
    throw new AppError("Insufficient credits. Please top up 5 ETB.", 402);
  }
  return user;
};

// 1. Start Interview
exports.startInterview = async (req, res, next) => {
  try {
    const { jobId, applicationId, interviewMode = 'text', strictnessLevel = 'moderate' } = req.body;
    const userId = req.user.id;

    // A. Check and prepare credit
    await checkAndDeductCredit(userId);

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return next(new AppError('Job not found', 404));

    // B. Generate AI questions
    const questions = await enhancedAI.generateInterviewQuestions(job, strictnessLevel, 10);

    // C. Atomic Transaction: Deduct Credit + Create Interview
    const [updatedUser, interview] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: 1 } }
      }),
      prisma.interview.create({
        data: {
          jobId,
          candidateId: userId,
          applicationId,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          interviewMode,
          strictnessLevel,
          questions: questions,
          antiCheatData: { tabSwitches: 0, copyPasteAttempts: 0, suspiciousActivities: [] },
          identityVerification: { snapshots: [], verified: false }
        }
      })
    ]);

    antiCheatService.initializeSession(applicationId, userId);

    res.status(201).json({
      success: true,
      data: { interviewId: interview.id, currentQuestion: questions[0] }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Submit Answer
exports.submitAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionIndex, answer, timeTaken, audioTranscript } = req.body;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { job: true }
    });

    if (!interview || interview.status !== 'IN_PROGRESS') {
      return next(new AppError('Interview not in progress', 400));
    }

    const textToEvaluate = audioTranscript || answer;
    const currentQuestion = interview.questions[questionIndex];

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
      score: evaluation.overallScore || 0,
      feedback: evaluation.feedback,
      isAI: plagiarism.isAIGenerated
    });

    await prisma.interview.update({
      where: { id },
      data: { responses }
    });

    res.json({
      success: true,
      data: {
        nextQuestion: followUp?.followUp ? { question: followUp.followUp, type: 'follow-up' } : interview.questions[questionIndex + 1],
        isLastQuestion: !followUp?.followUp && questionIndex + 1 >= interview.questions.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get Candidate Interviews (Fixed: Removed problematic 'application' include)
exports.getCandidateInterviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const interviews = await prisma.interview.findMany({
      where: { candidateId: userId },
      include: {
        job: { include: { company: true } }
      },
      orderBy: { startedAt: 'desc' }
    });

    res.json({ success: true, data: interviews });
  } catch (error) {
    next(error);
  }
};

// 4. Complete Interview
exports.completeInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interview = await prisma.interview.findUnique({ where: { id }, include: { job: true } });

    const report = await enhancedAI.generateComprehensiveReport(interview);
    const integrity = antiCheatService.calculateIntegrityScore(id);

    await prisma.interview.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        overallScore: report.overallScore,
        evaluation: report,
        integrityScore: integrity.score
      }
    });

    antiCheatService.endSession(id);
    res.json({ success: true, data: { overallScore: report.overallScore } });
  } catch (error) {
    next(error);
  }
};

// 5. Create Interview With Persona (Fixed: Added Credit Check)
exports.createInterviewWithPersona = async (req, res, next) => {
  try {
    const { personaId } = req.params;
    const { jobId, applicationId } = req.body;
    const userId = req.user.id;

    // ENFORCE 5 ETB CREDIT CHECK HERE TOO
    await checkAndDeductCredit(userId);

    const interview = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: 1 } }
      }),
      prisma.interview.create({
        data: {
          jobId,
          candidateId: userId,
          applicationId,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          persona: personaId,
          questions: [], 
          antiCheatData: { tabSwitches: 0, copyPasteAttempts: 0, suspiciousActivities: [] }
        }
      })
    ]);

    res.status(201).json({ success: true, data: { interviewId: interview[1].id } });
  } catch (error) {
    next(error);
  }
};

// Note: Implement other basic getters (getAllInterviews, getJobInterviews) 
// by ensuring you don't include 'application' until your schema is updated.