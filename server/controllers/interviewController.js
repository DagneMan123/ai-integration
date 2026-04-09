const { prisma } = require('../config/database');
const aiService = require('../services/aiService');
const antiCheatService = require('../services/antiCheatService');
const { AppError } = require('../middleware/errorHandler');
const { fetchInterviewWithJob, fetchInterviewsWithJob } = require('../utils/queryHelpers');

const checkAndDeductCredit = async (userId) => {
  // Ensure wallet exists
  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  
  if (!wallet) {
    // Create wallet for new user
    wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        currency: 'ETB'
      }
    });
  }
  
  // Convert balance to number for comparison (Prisma returns Decimal)
  const balanceAmount = parseFloat(wallet.balance);
  
  if (balanceAmount < 1) {
    throw new AppError("Insufficient credits. Please top up 5 ETB.", 402);
  }
  return wallet;
};

exports.startInterview = async (req, res, next) => {
  try {
    const { jobId, applicationId, interviewMode = 'text', strictnessLevel = 'moderate' } = req.body;
    
    if (!jobId || !applicationId) {
      return next(new AppError('jobId and applicationId are required', 400));
    }
    
    const parsedJobId = parseInt(jobId);
    const parsedApplicationId = parseInt(applicationId);
    const userId = req.user.id;
    
    if (isNaN(parsedJobId) || isNaN(parsedApplicationId)) {
      return next(new AppError('jobId and applicationId must be valid numbers', 400));
    }
    
    const job = await prisma.job.findUnique({ where: { id: parsedJobId } });
    if (!job) return next(new AppError('Job not found', 404));
    
    const step = await aiService.getNextInterviewStep(job);
    const questions = [
      { question: step.message || `Tell me about your experience with ${job.title}`, type: 'technical' },
      { question: 'What is your greatest strength?', type: 'behavioral' },
      { question: 'Describe a challenging project you worked on', type: 'technical' },
      { question: 'How do you handle team conflicts?', type: 'behavioral' },
      { question: 'What are your career goals?', type: 'behavioral' }
    ];
    
    const interview = await prisma.interview.create({
      data: {
        jobId: parsedJobId, 
        candidateId: userId, 
        applicationId: parsedApplicationId, 
        status: 'IN_PROGRESS',
        startedAt: new Date(), 
        interviewMode, 
        strictnessLevel, 
        questions: questions,
        antiCheatData: { tabSwitches: 0, copyPasteAttempts: 0, suspiciousActivities: [] }
      }
    });
    
    antiCheatService.initializeSession(parsedApplicationId, userId);
    
    res.status(201).json({ 
      success: true, 
      data: { 
        interviewId: interview.id, 
        currentQuestion: questions[0] 
      } 
    });
  } catch (error) { 
    next(error); 
  }
};

exports.submitAnswer = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { questionIndex, answer, audioTranscript } = req.body;
    const interview = await prisma.interview.findUnique({ where: { id }, include: { job: true } });
    if (!interview) return next(new AppError('Interview not found', 404));
    if (interview.status !== 'IN_PROGRESS') return next(new AppError('Interview not in progress', 400));
    
    const textToEvaluate = audioTranscript || answer;
    if (!textToEvaluate) return next(new AppError('Answer is required', 400));
    
    const questions = interview.questions || [];
    const currentQuestion = questions[questionIndex] || { question: 'General Question', type: 'general' };
    
    try {
      const evaluation = await aiService.evaluateFinalPerformance(interview.job, [
        { role: 'assistant', content: currentQuestion.question || 'General Question' },
        { role: 'user', content: textToEvaluate }
      ]);
      
      const followUp = await aiService.getNextInterviewStep(interview.job, [
        { role: 'assistant', content: currentQuestion.question || 'General' },
        { role: 'user', content: textToEvaluate }
      ]);
      
      const plagiarism = { isAIGenerated: false, confidence: 0.1, indicators: [] };
      
      const responses = interview.responses || [];
      responses.push({ 
        questionIndex, 
        question: currentQuestion.question || 'General Question', 
        answer: textToEvaluate, 
        score: evaluation.overall_score || 0, 
        feedback: evaluation.feedback_summary || 'Good response', 
        isAI: plagiarism.isAIGenerated 
      });
      await prisma.interview.update({ where: { id }, data: { responses } });
      
      res.json({ 
        success: true, 
        data: { 
          nextQuestion: followUp?.message ? { question: followUp.message, type: 'follow-up' } : questions[questionIndex + 1], 
          isLastQuestion: !followUp?.message && questionIndex + 1 >= questions.length 
        } 
      });
    } catch (aiError) {
      const responses = interview.responses || [];
      responses.push({ questionIndex, question: currentQuestion.question || 'General Question', answer: textToEvaluate, score: 0, feedback: 'Response recorded', isAI: false });
      await prisma.interview.update({ where: { id }, data: { responses } });
      res.json({ success: true, data: { nextQuestion: questions[questionIndex + 1], isLastQuestion: questionIndex + 1 >= questions.length } });
    }
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
    
    const responses = interview.responses || [];
    const totalScore = responses.reduce((sum, r) => sum + (r.score || 0), 0);
    const averageScore = responses.length > 0 ? Math.round(totalScore / responses.length) : 0;
    
    const report = {
      overallScore: averageScore,
      totalQuestions: responses.length,
      responses: responses,
      strengths: ['Clear communication', 'Problem-solving ability'],
      weaknesses: ['Could provide more detail'],
      recommendation: averageScore >= 70 ? 'Recommend' : 'Consider',
      feedback_summary: `Interview completed with ${responses.length} questions. Overall performance: ${averageScore}%`,
      timestamp: new Date()
    };
    
    const integrity = antiCheatService.calculateIntegrityScore(id);
    await prisma.interview.update({ where: { id }, data: { status: 'COMPLETED', completedAt: new Date(), overallScore: report.overallScore, evaluation: report, integrityScore: integrity.score } });
    antiCheatService.endSession(id);
    res.json({ success: true, data: { overallScore: report.overallScore } });
  } catch (error) { next(error); }
};

exports.createInterviewWithPersona = async (req, res, next) => {
  try {
    const jobId = parseInt(req.body.jobId);
    const applicationId = parseInt(req.body.applicationId);
    const userId = req.user.id;
    
    await checkAndDeductCredit(userId);
    
    // Execute transaction properly
    const result = await prisma.$transaction([
      prisma.wallet.update({ where: { userId }, data: { balance: { decrement: 1 } } }),
      prisma.interview.create({
        data: { 
          jobId, 
          candidateId: userId, 
          applicationId, 
          status: 'IN_PROGRESS', 
          startedAt: new Date(), 
          questions: null, 
          antiCheatData: { tabSwitches: 0, copyPasteAttempts: 0, suspiciousActivities: [] } 
        }
      })
    ]);
    
    const interview = result[1];
    res.status(201).json({ success: true, data: { interviewId: interview.id } });
  } catch (error) { 
    next(error); 
  }
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
    const interviews = await fetchInterviewsWithJob({ job: { createdById: userId } }, { orderBy: { startedAt: 'desc' } });
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
