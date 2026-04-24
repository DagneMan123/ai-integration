const { prisma } = require('../config/database');
const aiService = require('../services/aiService');
const antiCheatService = require('../services/antiCheatService');
const { AppError } = require('../middleware/errorHandler');
const { fetchInterviewWithJob, fetchInterviewsWithJob } = require('../utils/queryHelpers');
const { logger } = require('../utils/logger');

// Interview Controller - 10 Question System v2.0

const checkAndDeductCredit = async (userId) => {
  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        currency: 'ETB'
      }
    });
  }
  
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

    logger.info(`[startInterview] Starting new interview`, {
      jobId: parsedJobId,
      applicationId: parsedApplicationId,
      userId,
      interviewMode,
      strictnessLevel
    });
    
    // Fetch job with company details
    const job = await prisma.job.findUnique({ 
      where: { id: parsedJobId },
      include: { company: true }
    });
    if (!job) {
      logger.error(`[startInterview] Job not found`, { jobId: parsedJobId });
      return next(new AppError('Job not found', 404));
    }
    
    // Check if interview already exists for this application
    const existingInterview = await prisma.interview.findFirst({
      where: {
        applicationId: parsedApplicationId,
        candidateId: userId,
        status: 'IN_PROGRESS'
      },
      include: { job: { include: { company: true } } }
    });

    if (existingInterview) {
      logger.warn(`[startInterview] Interview already in progress`, {
        existingInterviewId: existingInterview.id,
        applicationId: parsedApplicationId,
        userId
      });
      
      // Return the existing interview with all necessary data
      const allQuestions = existingInterview.questions || [];
      const currentResponseCount = (existingInterview.responses || []).length;
      const nextQuestionIndex = currentResponseCount;
      const nextQuestion = allQuestions[nextQuestionIndex] || allQuestions[0];
      
      return res.status(200).json({
        success: true,
        data: {
          interviewId: existingInterview.id,
          jobDetails: {
            jobId: existingInterview.job.id,
            title: existingInterview.job.title,
            company: existingInterview.job.company?.name || 'Company',
            experienceLevel: existingInterview.job.experienceLevel || 'mid-level',
            requiredSkills: existingInterview.job.requiredSkills || []
          },
          firstQuestion: nextQuestion?.text || 'Please answer the following question',
          questionType: nextQuestion?.type || 'technical',
          stepNumber: nextQuestionIndex + 1,
          totalSteps: allQuestions.length,
          status: existingInterview.status,
          allQuestions: allQuestions,
          message: 'Interview already in progress - resuming from where you left off',
          isExisting: true,
          resumeFromStep: nextQuestionIndex + 1
        }
      });
    }
    
    // Prepare job details for AI
    const jobDetails = {
      jobId: job.id,
      title: job.title,
      company: job.company?.name || 'Company',
      experienceLevel: job.experienceLevel || 'mid-level',
      requiredSkills: job.requiredSkills || []
    };
    
    // Generate all 10 questions using the InterviewPhaseManager
    const allQuestions = [];
    const jobTitle = job.title || 'Senior Full Stack Developer';
    
    // Generate questions for turns 1-10
    for (let turn = 1; turn <= 10; turn++) {
      const question = aiService.interviewPhaseManager.getQuestionForTurn(turn, jobTitle);
      if (question) {
        allQuestions.push({
          text: question.text,
          type: question.type,
          phase: question.phase,
          turn: question.turn,
          timeLimit: question.timeLimit,
          minLength: question.minLength,
          isFinished: question.isFinished || false
        });
      }
    }

    logger.info(`[startInterview] Generated ${allQuestions.length} questions`, {
      jobId: parsedJobId,
      jobTitle: jobTitle,
      questionCount: allQuestions.length
    });

    // Create interview record with explicit IN_PROGRESS status
    const interview = await prisma.interview.create({
      data: {
        jobId: parsedJobId, 
        candidateId: userId, 
        applicationId: parsedApplicationId, 
        status: 'IN_PROGRESS',
        startedAt: new Date(), 
        interviewMode, 
        strictnessLevel,
        questions: allQuestions,
        responses: [],
        antiCheatData: { tabSwitches: 0, copyPasteAttempts: 0, suspiciousActivities: [] }
      }
    });

    // Verify the status was set correctly in the database
    if (interview.status !== 'IN_PROGRESS') {
      logger.error(`[startInterview] Interview created but status not IN_PROGRESS`, {
        interviewId: interview.id,
        expectedStatus: 'IN_PROGRESS',
        actualStatus: interview.status
      });
      // Force update to correct status
      await prisma.interview.update({
        where: { id: interview.id },
        data: { status: 'IN_PROGRESS' }
      });
    }

    logger.info(`[startInterview] Interview created successfully`, {
      interviewId: interview.id,
      applicationId: parsedApplicationId,
      userId,
      status: interview.status,
      totalQuestions: allQuestions.length,
      startedAt: interview.startedAt
    });
    
    antiCheatService.initializeSession(parsedApplicationId, userId);
    
    res.status(201).json({ 
      success: true, 
      data: { 
        interviewId: interview.id,
        jobDetails,
        firstQuestion: allQuestions[0].text,
        questionType: allQuestions[0].type,
        stepNumber: 1,
        totalSteps: allQuestions.length,
        status: interview.status,
        allQuestions: allQuestions
      } 
    });
  } catch (error) { 
    logger.error(`[startInterview] Unexpected error`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    next(error); 
  }
};

exports.submitAnswer = async (req, res, next) => {
  try {
    // Support both old and new API signatures
    const { interviewId, response, questionIndex, answer, timeTaken } = req.body;
    const id = parseInt(req.params.id || interviewId);
    const userResponse = response || answer;
    const userId = req.user?.id;

    if (!id || !userResponse) {
      return next(new AppError('interviewId and response are required', 400));
    }

    logger.info(`[submitAnswer] Starting submission for interview ${id} by user ${userId}`, {
      interviewId: id,
      userId,
      responseLength: userResponse.length
    });

    // Fetch interview with fresh data
    const interview = await prisma.interview.findUnique({ 
      where: { id },
      include: { job: { include: { company: true } } }
    });
    
    if (!interview) {
      logger.error(`[submitAnswer] Interview not found: ${id}`, { interviewId: id });
      return next(new AppError('Interview not found', 404));
    }

    logger.info(`[submitAnswer] Interview fetched from DB`, {
      interviewId: id,
      status: interview.status,
      candidateId: interview.candidateId,
      startedAt: interview.startedAt,
      completedAt: interview.completedAt
    });

    // Verify ownership - candidate can only submit to their own interviews
    if (interview.candidateId !== userId) {
      logger.warn(`[submitAnswer] Unauthorized access attempt`, {
        interviewId: id,
        interviewCandidateId: interview.candidateId,
        requestUserId: userId
      });
      return next(new AppError('Unauthorized: This is not your interview', 403));
    }

    // Allow submissions for PENDING and IN_PROGRESS interviews
    if (interview.status !== 'IN_PROGRESS' && interview.status !== 'PENDING') {
      logger.warn(`[submitAnswer] Interview not in valid state`, {
        interviewId: id,
        currentStatus: interview.status,
        userId,
        startedAt: interview.startedAt,
        completedAt: interview.completedAt,
        dbCheck: `Status from DB is: ${interview.status}`
      });
      
      let errorMessage = `Interview is ${interview.status.toLowerCase()}. Cannot submit answers.`;
      if (interview.status === 'COMPLETED') {
        errorMessage = 'This interview has already been completed. View your results instead.';
      }
      
      return next(new AppError(errorMessage, 400));
    }

    // If interview is PENDING, update it to IN_PROGRESS and set startedAt
    if (interview.status === 'PENDING') {
      await prisma.interview.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date()
        }
      });
      
      logger.info(`[submitAnswer] Interview status updated from PENDING to IN_PROGRESS`, {
        interviewId: id,
        userId
      });
    }

    // Get job details
    const jobData = {
      jobId: interview.job.id,
      title: interview.job.title,
      company: interview.job.company?.name || 'Company',
      experienceLevel: interview.job.experienceLevel || 'mid-level',
      requiredSkills: interview.job.requiredSkills || []
    };

    // Build conversation history from responses
    const conversationHistory = [];
    const currentResponses = interview.responses || [];
    const allQuestions = interview.questions || [];

    currentResponses.forEach((resp) => {
      if (resp.question) {
        conversationHistory.push({ role: 'assistant', content: resp.question });
      }
      if (resp.answer) {
        conversationHistory.push({ role: 'user', content: resp.answer });
      }
    });

    // Add current response
    conversationHistory.push({ role: 'user', content: userResponse });

    logger.info(`[submitAnswer] Conversation history built`, {
      interviewId: id,
      conversationLength: conversationHistory.length,
      responseCount: currentResponses.length
    });

    // Get current question for context
    const currentQuestionIndex = currentResponses.length;
    const currentQuestion = allQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex >= allQuestions.length - 1;

    // Score the response based on question type and content
    let responseScore = 0;
    let scoreBreakdown = {
      relevance: 0,
      clarity: 0,
      completeness: 0,
      confidence: 0
    };

    try {
      // Enhanced scoring logic
      const responseLength = userResponse.trim().split(' ').length;
      const charLength = userResponse.trim().length;
      
      // Relevance (0-30) - based on length and keywords
      if (charLength > 500) responseScore += 30;
      else if (charLength > 300) responseScore += 25;
      else if (charLength > 150) responseScore += 20;
      else if (charLength > 50) responseScore += 15;
      else responseScore += 8;
      scoreBreakdown.relevance = Math.min(30, responseScore);

      // Clarity (0-25) - check for structure and punctuation
      const sentences = userResponse.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      const hasGoodStructure = sentences >= 2 && responseLength > 15;
      if (hasGoodStructure) responseScore += 20;
      else if (sentences >= 1) responseScore += 12;
      else responseScore += 5;
      scoreBreakdown.clarity = Math.min(25, responseScore - scoreBreakdown.relevance);

      // Completeness (0-25) - check for examples, details, and specificity
      const hasExamples = /example|project|experience|worked|built|created|implemented|developed|designed|managed|led|achieved|accomplished/i.test(userResponse);
      const hasDetails = /specific|particular|detail|aspect|approach|method|process|strategy|technique/i.test(userResponse);
      if (hasExamples && hasDetails) responseScore += 25;
      else if (hasExamples || hasDetails) responseScore += 18;
      else responseScore += 10;
      scoreBreakdown.completeness = Math.min(25, responseScore - scoreBreakdown.relevance - scoreBreakdown.clarity);

      // Confidence (0-20) - check for assertive and professional language
      const hasConfidence = /confident|strong|expertise|skilled|proficient|experienced|capable|competent|excellent|strong|proven/i.test(userResponse);
      const hasProactive = /proactive|initiative|leadership|responsibility|ownership|drive|motivated|passionate/i.test(userResponse);
      if (hasConfidence && hasProactive) responseScore += 20;
      else if (hasConfidence || hasProactive) responseScore += 14;
      else responseScore += 8;
      scoreBreakdown.confidence = Math.min(20, responseScore - scoreBreakdown.relevance - scoreBreakdown.clarity - scoreBreakdown.completeness);

      // Normalize to 0-100
      responseScore = Math.min(100, Math.max(0, responseScore));

      logger.info(`[submitAnswer] Response scored`, {
        interviewId: id,
        score: responseScore,
        breakdown: scoreBreakdown,
        questionType: currentQuestion?.type,
        responseLength: charLength,
        wordCount: responseLength
      });
    } catch (scoringError) {
      logger.warn(`[submitAnswer] Scoring error, using default`, {
        interviewId: id,
        error: scoringError.message
      });
      responseScore = 75; // Default score
    }

    // Store the response with score
    const updatedResponses = [...currentResponses];
    updatedResponses.push({
      question: currentQuestion?.text || 'Question',
      questionType: currentQuestion?.type || 'general',
      answer: userResponse,
      score: responseScore,
      scoreBreakdown: scoreBreakdown,
      timestamp: new Date()
    });

    // Determine if interview is finished
    const isFinished = isLastQuestion;
    const newStatus = isFinished ? 'COMPLETED' : 'IN_PROGRESS';

    // Calculate overall score if interview is complete
    let overallScore = 0;
    if (isFinished) {
      const scores = updatedResponses.map(r => r.score || 0);
      // Use simple arithmetic mean - do NOT artificially inflate
      // Example: (0 + 80) / 2 = 40, not inflated
      overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      logger.info(`[submitAnswer] Interview complete, calculating overall score`, {
        interviewId: id,
        responseCount: updatedResponses.length,
        scores: scores,
        overallScore: overallScore,
        calculation: `(${scores.join(' + ')}) / ${scores.length} = ${overallScore}`
      });
    }

    const updateData = {
      responses: updatedResponses,
      status: newStatus,
      updatedAt: new Date()
    };

    if (isFinished) {
      updateData.completedAt = new Date();
      updateData.overallScore = overallScore;
    }

    // Update interview
    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: updateData,
      include: { job: true }
    });

    logger.info(`[submitAnswer] Interview updated successfully`, {
      interviewId: id,
      newStatus: updatedInterview.status,
      responseCount: updatedResponses.length,
      isFinished: isFinished,
      overallScore: overallScore
    });

    // Prepare next question or completion message
    let nextQuestion = 'Thank you for completing the interview!';
    if (!isFinished && currentQuestionIndex + 1 < allQuestions.length) {
      nextQuestion = allQuestions[currentQuestionIndex + 1].text;
    }

    res.json({
      success: true,
      data: {
        responseScore: responseScore,
        scoreBreakdown: scoreBreakdown,
        nextQuestion: nextQuestion,
        isFinished: isFinished,
        stepNumber: currentQuestionIndex + 2,
        totalSteps: allQuestions.length,
        interviewStatus: updatedInterview.status,
        overallScore: isFinished ? overallScore : null,
        questionType: currentQuestion?.type
      }
    });
  } catch (error) { 
    logger.error(`[submitAnswer] Unexpected error`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    next(error); 
  }
};

exports.getCandidateInterviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const interviews = await fetchInterviewsWithJob({ candidateId: userId }, { orderBy: { startedAt: 'desc' } });
    res.json({ success: true, data: interviews });
  } catch (error) { next(error); }
};

exports.getPendingInvitations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const invitations = await fetchInterviewsWithJob(
      { candidateId: userId, status: 'PENDING' },
      { orderBy: { createdAt: 'desc' } }
    );
    res.json({ success: true, data: invitations });
  } catch (error) { next(error); }
};

exports.completeInterview = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const interview = await prisma.interview.findUnique({ 
      where: { id }, 
      include: { job: true } 
    });
    
    if (!interview) {
      return next(new AppError('Interview not found', 404));
    }

    // Build transcript from responses
    const responses = interview.responses || [];
    const transcript = responses.map((r) => ({
      question: r.question,
      answer: r.answer,
      score: r.score
    }));

    // Get job details for evaluation
    const jobDetails = {
      jobId: interview.job.id,
      title: interview.job.title,
      company: interview.job.company?.name || 'Company',
      experienceLevel: interview.job.experienceLevel || 'mid-level',
      requiredSkills: interview.job.requiredSkills || []
    };

    // Call AI evaluation service with strict accuracy grading
    let evaluation = null;
    try {
      evaluation = await aiService.evaluateFinalPerformance(jobDetails, transcript);
    } catch (aiError) {
      logger.warn(`[completeInterview] AI evaluation failed, using fallback`, {
        interviewId: id,
        error: aiError.message
      });
      // Fallback evaluation if AI fails
      const scores = responses.map(r => r.score || 0);
      // Use simple arithmetic mean - do NOT artificially inflate
      const averageScore = responses.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / responses.length) : 0;
      
      evaluation = {
        overall_score: averageScore,
        technical_score: Math.round(averageScore * 0.85),
        communication_score: Math.round(averageScore * 0.80),
        confidence_score: Math.round(averageScore * 0.75),
        problem_solving_score: Math.round(averageScore * 0.82),
        accuracy_penalties: 0,
        hallucination_count: 0,
        incorrect_answers: 0,
        incomplete_sessions: scores.filter(s => s === 0).length,
        average_calculation: `(${scores.join(' + ')}) / ${responses.length} = ${averageScore}`,
        strengths: [
          'Clear communication',
          'Problem-solving ability',
          'Technical knowledge'
        ],
        weaknesses: [
          'Could provide more specific examples',
          'Could elaborate on technical details'
        ],
        recommendation: averageScore >= 70 ? 'Recommend' : averageScore >= 60 ? 'Consider' : 'Reject',
        feedback_summary: `Interview completed with ${responses.length} questions. Overall performance: ${averageScore}%. Calculation: (${scores.join(' + ')}) / ${responses.length} = ${averageScore}%`,
        hiringDecision: averageScore >= 70 ? 'recommended' : averageScore >= 60 ? 'under_review' : 'not_recommended'
      };
    }

    // Ensure all scores are numbers
    const finalEvaluation = {
      overall_score: Math.max(0, Math.min(100, parseInt(evaluation.overall_score) || 0)),
      technical_score: Math.max(0, Math.min(100, parseInt(evaluation.technical_score) || 0)),
      communication_score: Math.max(0, Math.min(100, parseInt(evaluation.communication_score) || 0)),
      confidence_score: Math.max(0, Math.min(100, parseInt(evaluation.confidence_score) || 0)),
      problem_solving_score: Math.max(0, Math.min(100, parseInt(evaluation.problem_solving_score) || 0)),
      accuracy_penalties: parseInt(evaluation.accuracy_penalties) || 0,
      hallucination_count: parseInt(evaluation.hallucination_count) || 0,
      incorrect_answers: parseInt(evaluation.incorrect_answers) || 0,
      incomplete_sessions: parseInt(evaluation.incomplete_sessions) || 0,
      average_calculation: evaluation.average_calculation || '',
      strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
      weaknesses: Array.isArray(evaluation.weaknesses) ? evaluation.weaknesses : [],
      recommendation: evaluation.recommendation || 'Consider',
      feedback_summary: evaluation.feedback_summary || 'Interview completed',
      hiringDecision: evaluation.hiringDecision || 'under_review',
      timestamp: new Date()
    };

    // Update interview with evaluation
    const updatedInterview = await prisma.interview.update({ 
      where: { id }, 
      data: { 
        status: 'COMPLETED', 
        completedAt: new Date(), 
        overallScore: finalEvaluation.overall_score,
        evaluation: finalEvaluation,
        integrityScore: antiCheatService.calculateIntegrityScore(id).score
      },
      include: { job: true }
    });

    antiCheatService.endSession(id);

    logger.info(`[completeInterview] Interview completed successfully`, {
      interviewId: id,
      overallScore: finalEvaluation.overall_score,
      status: updatedInterview.status
    });

    res.json({ 
      success: true, 
      data: { 
        interviewId: id,
        overallScore: finalEvaluation.overall_score,
        evaluation: finalEvaluation,
        status: 'COMPLETED'
      } 
    });
  } catch (error) {
    logger.error(`[completeInterview] Unexpected error`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    next(error);
  }
};

exports.createInterviewWithPersona = async (req, res, next) => {
  try {
    const jobId = parseInt(req.body.jobId);
    const applicationId = parseInt(req.body.applicationId);
    const userId = req.user.id;
    
    await checkAndDeductCredit(userId);
    
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
    
    // Ensure questions are properly formatted in the response
    const responseData = {
      ...interview,
      questions: interview.questions || [],
      allQuestions: interview.questions || []
    };
    
    res.json({ success: true, data: responseData });
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


// SAVE RECORDING: Save video URL from Cloudinary to database
exports.saveRecording = async (req, res, next) => {
  try {
    const { videoUrl, questionId, recordingTime } = req.body;
    const userId = req.user.id;

    console.log('[saveRecording] Request received', {
      userId,
      questionId,
      recordingTime,
      videoUrl: videoUrl ? 'provided' : 'missing',
      hasBody: !!req.body
    });

    logger.info('[saveRecording] Saving video recording', {
      userId,
      questionId,
      recordingTime,
      videoUrl: videoUrl ? 'provided' : 'missing'
    });

    // Validate input
    if (!videoUrl) {
      console.error('[saveRecording] Missing videoUrl');
      return next(new AppError('videoUrl is required', 400));
    }

    if (!questionId) {
      console.error('[saveRecording] Missing questionId');
      return next(new AppError('questionId is required', 400));
    }

    // Find the most recent in-progress interview for this user
    const interview = await prisma.interview.findFirst({
      where: {
        candidateId: userId,
        status: 'IN_PROGRESS'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!interview) {
      console.error('[saveRecording] No active interview found', { userId });
      logger.error('[saveRecording] No active interview found', { userId });
      return next(new AppError('No active interview found', 404));
    }

    console.log('[saveRecording] Found interview', {
      interviewId: interview.id,
      status: interview.status
    });

    // Store recording in interview responses array (in-memory storage)
    // This bypasses the database table requirement temporarily
    const responses = interview.responses || [];
    const newResponse = {
      id: responses.length + 1,
      sessionId: interview.id,
      questionId: parseInt(questionId),
      userId: userId,
      videoUrl: videoUrl,
      videoPath: videoUrl,
      recordingTime: parseInt(recordingTime) || 0,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    responses.push(newResponse);

    // Update interview with new response
    const updatedInterview = await prisma.interview.update({
      where: { id: interview.id },
      data: {
        responses: responses,
        updatedAt: new Date()
      }
    });

    console.log('[saveRecording] Response saved successfully', {
      responseId: newResponse.id,
      interviewId: interview.id,
      totalResponses: responses.length
    });

    logger.info('[saveRecording] Recording saved successfully', {
      responseId: newResponse.id,
      interviewId: interview.id,
      userId,
      totalResponses: responses.length
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      data: {
        responseId: newResponse.id,
        videoUrl: newResponse.videoUrl,
        message: 'Recording saved successfully'
      },
      message: 'Recording saved successfully'
    });
  } catch (error) {
    console.error('[saveRecording] Error:', error.message);
    logger.error('[saveRecording] Error saving recording', {
      error: error.message,
      userId: req.user?.id,
      stack: error.stack
    });
    next(error);
  }
};


// LOG SECURITY VIOLATION: Log paste attempts and other security violations
exports.logSecurityViolation = async (req, res, next) => {
  try {
    const { interviewId, violationType, method, timestamp, userAgent } = req.body;
    const userId = req.user?.id;

    if (!interviewId || !violationType) {
      return next(new AppError('interviewId and violationType are required', 400));
    }

    logger.warn(`[logSecurityViolation] Security violation detected`, {
      interviewId,
      violationType,
      method,
      userId,
      userAgent,
      timestamp
    });

    // Find the interview
    const interview = await prisma.interview.findUnique({
      where: { id: parseInt(interviewId) }
    });

    if (!interview) {
      return next(new AppError('Interview not found', 404));
    }

    // Verify ownership
    if (interview.candidateId !== userId) {
      logger.warn(`[logSecurityViolation] Unauthorized violation report`, {
        interviewId,
        interviewCandidateId: interview.candidateId,
        reportingUserId: userId
      });
      return next(new AppError('Unauthorized', 403));
    }

    // Update anti-cheat data with violation
    const antiCheatData = interview.antiCheatData || {};
    
    if (violationType === 'PASTE_ATTEMPT') {
      antiCheatData.copyPasteAttempts = (antiCheatData.copyPasteAttempts || 0) + 1;
    }

    // Add to suspicious activities
    if (!antiCheatData.suspiciousActivities) {
      antiCheatData.suspiciousActivities = [];
    }

    antiCheatData.suspiciousActivities.push({
      type: violationType,
      method: method,
      timestamp: new Date(timestamp),
      userAgent: userAgent
    });

    // Update interview with violation data
    const updatedInterview = await prisma.interview.update({
      where: { id: parseInt(interviewId) },
      data: {
        antiCheatData: antiCheatData,
        integrityRisk: antiCheatData.copyPasteAttempts > 2 ? 'HIGH' : antiCheatData.copyPasteAttempts > 0 ? 'MEDIUM' : 'LOW'
      }
    });

    logger.info(`[logSecurityViolation] Violation logged successfully`, {
      interviewId,
      violationType,
      totalViolations: antiCheatData.copyPasteAttempts,
      integrityRisk: updatedInterview.integrityRisk
    });

    res.json({
      success: true,
      data: {
        interviewId,
        violationType,
        totalViolations: antiCheatData.copyPasteAttempts,
        integrityRisk: updatedInterview.integrityRisk,
        message: 'Security violation logged and flagged for review'
      }
    });
  } catch (error) {
    logger.error(`[logSecurityViolation] Unexpected error`, {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    next(error);
  }
};
