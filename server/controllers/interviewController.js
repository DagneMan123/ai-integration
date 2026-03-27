const { prisma } = require('../config/database');
const enhancedAI = require('../services/enhancedAIService');
const antiCheatService = require('../services/antiCheatService');
const { AppError } = require('../middleware/errorHandler');
const { fetchInterviewWithJob, fetchInterviewsWithJob } = require('../utils/queryHelpers');

const checkAndDeductCredit = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.credits < 1) {
    throw new AppError("Insufficient credits. Please top up 5 ETB.", 402);
  }
  return user;
};

exports.startInterview = async (req, res, next) => {
  try {
    const jobId = parseInt(req.body.jobId);
    const applicationId = parseInt(req.body.applicationId);
    const userId = req.user.id;
    const { interviewMode = 'text', strictnessLevel = 'moderate' } = req.body;
    await checkAndDeductCredit(userId);
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return next(new AppError('Job not found', 404));
    const questions = await enhancedAI.generateInterviewQuestions(job, strictnessLevel, 10);
    const [, interview] = await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { credits: { decrement: 1 } } }),
      prisma.interview.create({
        data: {
          jobId, candidateId: userId, applicationId, status: 'IN_PROGRESS',
          startedAt: new Date(), interviewMode, strictnessLevel, questions,
          antiCheatData: { tabSwitches: 0, copyPasteAttempts: 0, suspiciousActivities: [] }
        }
      })
    ]);
    antiCheatService.initializeSession(applicationId, userId);
    res.status(201).json({ success: true, data: { interviewId: interview.id, currentQuestion: questions[0] } });
  } catch (error) { next(error); }
};

exports.submitAnswer = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { questionIndex, answer, audioTranscript } = req.body;
    const interview = await prisma.interview.findUnique({ where: { id }, include: { job: true } });
    if (!interview || interview.status !== 'IN_PROGRESS') return next(new AppError('Interview not in progress', 400));
    const textToEvaluate = audioTranscript || answer;
    const currentQuestion = interview.questions[questionIndex];
    const [evaluation, followUp, plagiarism] = await Promise.all([
      enhancedAI.evaluateAnswer(currentQuestion, textToEvaluate, interview.job, interview.strictnessLevel),
      enhancedAI.generateFollowUpQuestion(currentQuestion.question, textToEvaluate, interview.job),
      enhancedAI.detectAIContent(textToEvaluate)
    ]);
    const responses = interview.responses || [];
    responses.push({ questionIndex, question: currentQuestion.question, answer: textToEvaluate, score: evaluation.overallScore || 0, feedback: evaluation.feedback, isAI: plagiarism.isAIGenerated });
    await prisma.interview.update({ where: { id }, data: { responses } });
    res.json({ success: true, data: { nextQuestion: followUp?.followUp ? { question: followUp.followUp, type: 'follow-up' } : interview.questions[questionIndex + 1], isLastQuestion: !followUp?.followUp && questionIndex + 1 >= interview.questions.length } });
  } catch (error) { next(error); }
};

exports.getCandidateInterviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const interviews = await fetchInterviewsWithJob({ candidateId: userId }, { orderBy: { startedAt: 'desc' } });
    res.json({ success: true, data: interviews });
  } catch (error) { next(error); }
};

exports.completeInterview = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const interview = await prisma.interview.findUnique({ where: { id }, include: { job: true } });
    const report = await enhancedAI.generateComprehensiveReport(interview);
    const integrity = antiCheatService.calculateIntegrityScore(id);
    await prisma.interview.update({ where: { id }, data: { status: 'COMPLETED', completedAt: new Date(), overallScore: report.overallScore, evaluation: report, integrityScore: integrity.score } });
    antiCheatService.endSession(id);
    res.json({ success: true, data: { overallScore: report.overallScore } });
  } catch (error) { next(error); }
};

exports.createInterviewWithPersona = async (req, res, next) => {
  try {
    const { personaId } = req.params;
    const jobId = parseInt(req.body.jobId);
    const applicationId = parseInt(req.body.applicationId);
    const userId = req.user.id;
    await checkAndDeductCredit(userId);
    const interview = await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { credits: { decrement: 1 } } }),
      prisma.interview.create({
        data: { jobId, candidateId: userId, applicationId, status: 'IN_PROGRESS', startedAt: new Date(), persona: personaId, questions: [], antiCheatData: { tabSwitches: 0, copyPasteAttempts: 0, suspiciousActivities: [] } }
      })
    ]);
    res.status(201).json({ success: true, data: { interviewId: interview[1].id } });
  } catch (error) { next(error); }
};

exports.recordAntiCheatEvent = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const interview = await prisma.interview.findUnique({ where: { id } });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    res.json({ success: true, message: 'Anti-cheat event recorded' });
  } catch (error) { next(error); }
};

exports.recordIdentitySnapshot = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const interview = await prisma.interview.findUnique({ where: { id } });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    res.json({ success: true, message: 'Identity snapshot recorded' });
  } catch (error) { next(error); }
};

exports.getCandidateResults = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const results = await fetchInterviewsWithJob({ candidateId: userId, status: 'COMPLETED' }, { orderBy: { completedAt: 'desc' } });
    res.json({ success: true, data: results });
  } catch (error) { next(error); }
};

exports.getInterviewReport = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const interview = await fetchInterviewWithJob(id);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    res.json({ success: true, data: interview });
  } catch (error) { next(error); }
};

exports.getIntegrityReport = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const interview = await prisma.interview.findUnique({ where: { id } });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    res.json({ success: true, data: { integrityScore: interview.integrityScore || 0, integrityRisk: interview.integrityRisk || 'LOW', antiCheatData: interview.antiCheatData } });
  } catch (error) { next(error); }
};

exports.getEmployerInterviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const interviews = await fetchInterviewsWithJob({ job: { createdBy: userId } }, { orderBy: { startedAt: 'desc' } });
    res.json({ success: true, data: interviews });
  } catch (error) { next(error); }
};

exports.getJobInterviews = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.jobId);
    const interviews = await fetchInterviewsWithJob({ jobId: jobId }, { orderBy: { startedAt: 'desc' } });
    res.json({ success: true, data: interviews });
  } catch (error) { next(error); }
};

exports.evaluateInterview = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { score, feedback } = req.body;
    const interview = await prisma.interview.findUnique({ where: { id } });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    const updated = await prisma.interview.update({ where: { id }, data: { overallScore: score, feedback: feedback } });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

exports.getAllInterviews = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const interviews = await fetchInterviewsWithJob({}, { orderBy: { startedAt: 'desc' }, take: parseInt(limit), skip: parseInt(offset) });
    const total = await prisma.interview.count();
    res.json({ success: true, data: interviews, pagination: { total, limit: parseInt(limit), offset: parseInt(offset) } });
  } catch (error) { next(error); }
};

exports.getInterviewPersonas = async (req, res, next) => {
  try {
    const personas = [
      { id: 'tech-lead', name: 'Tech Lead', description: 'Experienced technical interviewer', style: 'technical', difficulty: 'hard' },
      { id: 'hr-manager', name: 'HR Manager', description: 'Behavioral and cultural fit interviewer', style: 'behavioral', difficulty: 'medium' },
      { id: 'product-manager', name: 'Product Manager', description: 'Product thinking and problem-solving', style: 'problem-solving', difficulty: 'hard' }
    ];
    res.json({ success: true, data: personas });
  } catch (error) { next(error); }
};

exports.getPersonaDetails = async (req, res, next) => {
  try {
    const { personaId } = req.params;
    const personaDetails = {
      'tech-lead': { id: 'tech-lead', name: 'Tech Lead', focusAreas: ['System Design', 'Algorithms', 'Code Quality'], questionCount: 15, estimatedDuration: 90 },
      'hr-manager': { id: 'hr-manager', name: 'HR Manager', focusAreas: ['Communication', 'Teamwork', 'Leadership'], questionCount: 10, estimatedDuration: 60 },
      'product-manager': { id: 'product-manager', name: 'Product Manager', focusAreas: ['Problem Solving', 'Product Thinking', 'Analytics'], questionCount: 12, estimatedDuration: 75 }
    };
    const details = personaDetails[personaId];
    if (!details) return res.status(404).json({ success: false, message: 'Persona not found' });
    res.json({ success: true, data: details });
  } catch (error) { next(error); }
};
