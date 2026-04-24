const OpenAI = require('openai');
const { logger } = require('../utils/logger');

/**
 * AI Evaluation Service - Strict Accuracy Grading with Weighted Scoring
 * 
 * Scoring Formula:
 * - Technical Accuracy: 70% of total score
 * - Communication Skills: 30% of total score
 * 
 * Penalties:
 * - Hallucination/Wrong Information: -40-50% from accuracy score
 * - Incomplete/Vague Answer: -20-30% from accuracy score
 * - "I don't know": 0% but no penalty (better than wrong answer)
 */

let openai = null;

if (process.env.GROQ_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
  });
}

const AI_MODEL = "llama-3.1-8b-instant";
const MOCK_MODE = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AI === 'true';

class AIEvaluationService {
  /**
   * Evaluate a single response against a gold standard answer
   * Returns detailed scoring with accuracy and communication breakdown
   */
  async evaluateSingleResponse(question, userAnswer, goldStandardAnswer, jobContext) {
    try {
      if (MOCK_MODE) {
        return this.getMockEvaluation(userAnswer, goldStandardAnswer);
      }

      const systemPrompt = `
You are an expert technical interviewer and evaluator. Your job is to evaluate candidate responses with STRICT ACCURACY GRADING.

CRITICAL RULES:
1. PRIORITIZE TECHNICAL CORRECTNESS above all else
2. If the answer is factually wrong, deduct 40-50% from accuracy score
3. If the answer contains hallucination (made-up information), deduct 50% from accuracy score
4. If the answer is vague or incomplete, deduct 20-30% from accuracy score
5. If the candidate says "I don't know", give 0% but NO penalty (this is better than wrong information)
6. Compare STRICTLY against the gold standard answer provided

SCORING BREAKDOWN:
- Technical Accuracy (0-100): How correct is the answer factually?
- Communication (0-100): How clear, fluent, and professional is the delivery?

WEIGHTED FINAL SCORE:
- Final Score = (Technical Accuracy × 0.70) + (Communication × 0.30)

Return ONLY valid JSON with no markdown or extra text.
`;

      const userPrompt = `
QUESTION: ${question}

GOLD STANDARD ANSWER (Reference):
${goldStandardAnswer}

CANDIDATE'S ANSWER:
${userAnswer}

JOB CONTEXT: ${jobContext || 'General technical role'}

Evaluate this response with STRICT accuracy grading. Return JSON:
{
  "technical_accuracy": <0-100>,
  "technical_accuracy_reasoning": "<explain if answer is correct, partially correct, or wrong>",
  "accuracy_penalty": <0-50>,
  "penalty_reason": "<why penalty was applied>",
  "communication_score": <0-100>,
  "communication_reasoning": "<clarity, fluency, professionalism>",
  "final_score": <0-100>,
  "is_hallucination": <true/false>,
  "is_incomplete": <true/false>,
  "is_correct": <true/false>,
  "feedback": "<specific feedback for candidate>"
}
`;

      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      // Validate and normalize
      return {
        technical_accuracy: Math.max(0, Math.min(100, parseInt(result.technical_accuracy) || 0)),
        technical_accuracy_reasoning: result.technical_accuracy_reasoning || '',
        accuracy_penalty: Math.max(0, Math.min(50, parseInt(result.accuracy_penalty) || 0)),
        penalty_reason: result.penalty_reason || '',
        communication_score: Math.max(0, Math.min(100, parseInt(result.communication_score) || 0)),
        communication_reasoning: result.communication_reasoning || '',
        final_score: Math.max(0, Math.min(100, parseInt(result.final_score) || 0)),
        is_hallucination: result.is_hallucination === true,
        is_incomplete: result.is_incomplete === true,
        is_correct: result.is_correct === true,
        feedback: result.feedback || ''
      };
    } catch (error) {
      logger.error('Error evaluating single response:', error);
      throw error;
    }
  }

  /**
   * Evaluate entire interview with weighted scoring
   * Calculates overall performance with proper average handling
   */
  async evaluateFullInterview(jobDetails, responses, goldStandardAnswers = []) {
    try {
      if (MOCK_MODE) {
        return this.getMockFullEvaluation(responses);
      }

      const systemPrompt = `
You are an expert technical recruiter and evaluator. Evaluate the entire interview with STRICT ACCURACY GRADING.

CRITICAL EVALUATION RULES:
1. Technical Accuracy is 70% of the score - prioritize correctness
2. Communication is 30% of the score
3. Wrong answers get 40-50% penalty
4. Hallucinations get 50% penalty
5. "I don't know" answers get 0% but no penalty
6. Calculate average correctly: (0 + 80) / 2 = 40%, NOT artificially inflated

SCORING FORMULA:
For each response:
  - Technical Accuracy (0-100)
  - Communication (0-100)
  - Weighted Score = (Technical × 0.70) + (Communication × 0.30)

Overall Score = Average of all weighted scores (simple arithmetic mean)

Return ONLY valid JSON with no markdown.
`;

      const responsesSummary = responses.map((r, idx) => `
Q${idx + 1}: ${r.question}
Answer: ${r.answer}
Length: ${r.answer.length} chars
`).join('\n');

      const userPrompt = `
POSITION: ${jobDetails.title}
REQUIRED SKILLS: ${jobDetails.requiredSkills?.join(', ') || 'General'}

INTERVIEW RESPONSES:
${responsesSummary}

Evaluate all responses with strict accuracy grading. Return JSON:
{
  "response_evaluations": [
    {
      "question_number": <1-10>,
      "technical_accuracy": <0-100>,
      "communication_score": <0-100>,
      "weighted_score": <0-100>,
      "is_correct": <true/false>,
      "is_hallucination": <true/false>,
      "feedback": "<specific feedback>"
    }
  ],
  "overall_technical_score": <0-100>,
  "overall_communication_score": <0-100>,
  "overall_score": <0-100>,
  "average_calculation": "<show math: (score1 + score2 + ...) / count>",
  "strengths": [<string>, <string>, <string>],
  "weaknesses": [<string>, <string>],
  "hallucination_count": <number>,
  "incorrect_count": <number>,
  "correct_count": <number>,
  "recommendation": "<Strongly Recommend | Recommend | Consider | Reject>",
  "feedback_summary": "<overall assessment>",
  "hiring_decision": "<recommended | under_review | not_recommended>"
}
`;

      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content);

      // Validate and normalize all scores
      return {
        response_evaluations: (result.response_evaluations || []).map(r => ({
          question_number: r.question_number || 0,
          technical_accuracy: Math.max(0, Math.min(100, parseInt(r.technical_accuracy) || 0)),
          communication_score: Math.max(0, Math.min(100, parseInt(r.communication_score) || 0)),
          weighted_score: Math.max(0, Math.min(100, parseInt(r.weighted_score) || 0)),
          is_correct: r.is_correct === true,
          is_hallucination: r.is_hallucination === true,
          feedback: r.feedback || ''
        })),
        overall_technical_score: Math.max(0, Math.min(100, parseInt(result.overall_technical_score) || 0)),
        overall_communication_score: Math.max(0, Math.min(100, parseInt(result.overall_communication_score) || 0)),
        overall_score: Math.max(0, Math.min(100, parseInt(result.overall_score) || 0)),
        average_calculation: result.average_calculation || '',
        strengths: Array.isArray(result.strengths) ? result.strengths : [],
        weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
        hallucination_count: parseInt(result.hallucination_count) || 0,
        incorrect_count: parseInt(result.incorrect_count) || 0,
        correct_count: parseInt(result.correct_count) || 0,
        recommendation: result.recommendation || 'Consider',
        feedback_summary: result.feedback_summary || '',
        hiring_decision: result.hiring_decision || 'under_review'
      };
    } catch (error) {
      logger.error('Error evaluating full interview:', error);
      throw error;
    }
  }

  /**
   * Calculate weighted score from technical and communication scores
   * Formula: (Technical × 0.70) + (Communication × 0.30)
   */
  calculateWeightedScore(technicalScore, communicationScore) {
    const technical = Math.max(0, Math.min(100, technicalScore || 0));
    const communication = Math.max(0, Math.min(100, communicationScore || 0));
    return Math.round((technical * 0.70) + (communication * 0.30));
  }

  /**
   * Calculate average score correctly
   * Example: (0 + 80) / 2 = 40, NOT artificially inflated
   */
  calculateAverageScore(scores) {
    if (!Array.isArray(scores) || scores.length === 0) return 0;
    const validScores = scores.map(s => Math.max(0, Math.min(100, s || 0)));
    const sum = validScores.reduce((a, b) => a + b, 0);
    return Math.round(sum / validScores.length);
  }

  /**
   * Mock evaluation for development/testing
   */
  getMockEvaluation(userAnswer, goldStandardAnswer) {
    const answerLength = userAnswer.length;
    const hasExamples = /example|project|experience|implemented/i.test(userAnswer);
    const hasDetails = /specific|detail|approach|method/i.test(userAnswer);
    
    let technicalAccuracy = 70;
    if (answerLength < 50) technicalAccuracy = 40;
    else if (answerLength < 200) technicalAccuracy = 60;
    else if (hasExamples && hasDetails) technicalAccuracy = 85;

    const communicationScore = hasExamples && hasDetails ? 80 : 65;
    const finalScore = this.calculateWeightedScore(technicalAccuracy, communicationScore);

    return {
      technical_accuracy: technicalAccuracy,
      technical_accuracy_reasoning: 'Mock evaluation based on answer length and content',
      accuracy_penalty: 0,
      penalty_reason: '',
      communication_score: communicationScore,
      communication_reasoning: 'Mock evaluation based on clarity indicators',
      final_score: finalScore,
      is_hallucination: false,
      is_incomplete: answerLength < 100,
      is_correct: technicalAccuracy >= 70,
      feedback: 'Mock feedback for development'
    };
  }

  /**
   * Mock full interview evaluation
   */
  getMockFullEvaluation(responses) {
    const evaluations = responses.map((r, idx) => {
      const score = Math.round(Math.random() * 100);
      return {
        question_number: idx + 1,
        technical_accuracy: score,
        communication_score: Math.round(score * 0.9),
        weighted_score: this.calculateWeightedScore(score, Math.round(score * 0.9)),
        is_correct: score >= 70,
        is_hallucination: false,
        feedback: `Mock feedback for question ${idx + 1}`
      };
    });

    const scores = evaluations.map(e => e.weighted_score);
    const overallScore = this.calculateAverageScore(scores);

    return {
      response_evaluations: evaluations,
      overall_technical_score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      overall_communication_score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 0.9),
      overall_score: overallScore,
      average_calculation: `(${scores.join(' + ')}) / ${scores.length} = ${overallScore}`,
      strengths: ['Clear communication', 'Technical knowledge', 'Problem-solving'],
      weaknesses: ['Could provide more examples', 'Could elaborate on details'],
      hallucination_count: 0,
      incorrect_count: Math.floor(responses.length * 0.2),
      correct_count: Math.floor(responses.length * 0.8),
      recommendation: overallScore >= 70 ? 'Recommend' : 'Consider',
      feedback_summary: `Overall performance: ${overallScore}%`,
      hiring_decision: overallScore >= 70 ? 'recommended' : 'under_review'
    };
  }
}

module.exports = new AIEvaluationService();
