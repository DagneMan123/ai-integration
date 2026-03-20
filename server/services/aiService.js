const OpenAI = require('openai');
const { logAI } = require('../utils/logger');

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} else {
  console.warn('⚠️ OPENAI_API_KEY not set. AI features will be disabled.');
}

class AIService {
  /**
   * 1. Start or Continue an Interview (Turn-by-turn logic)
   * This handles bilingual (Amharic & English) interaction.
   */
  async getNextInterviewStep(jobDetails, transcript = [], currentCandidateResponse = "") {
    try {
      if (!openai) throw new Error('AI Service not configured');

      const systemPrompt = `
        You are an expert HR Interviewer in Ethiopia. 
        Position: ${jobDetails.title}.
        Level: ${jobDetails.experience_level || 'General'}.
        
        INSTRUCTIONS:
        1. Conduct the interview in a mix of English and Amharic (Bilingual).
        2. Ask only ONE question at a time.
        3. If a candidate answers, acknowledge it briefly and ask a follow-up or the next logical question.
        4. If it's the start, greet and ask the first question.
        5. After 5-7 questions, conclude the interview.

        Return response in JSON format:
        {
          "message": "The question or acknowledgement in English/Amharic",
          "isFinished": false,
          "currentStep": 1
        }
      `;

      const messages = [
        { role: "system", content: systemPrompt },
        ...transcript,
      ];

      if (currentCandidateResponse) {
        messages.push({ role: "user", content: currentCandidateResponse });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Upgraded to gpt-4o for better Amharic & Speed
        messages: messages,
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logAI('error', 'AI Step generation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * 2. Final Evaluation (Scoring)
   */
  async evaluateFinalPerformance(jobDetails, fullTranscript) {
    try {
      const prompt = `
        Analyze this full interview transcript for the ${jobDetails.title} position.
        Be objective and fair. 
        
        Return JSON format:
        {
          "overall_score": 0-100,
          "technical_score": 0-100,
          "communication_score": 0-100,
          "strengths": ["list"],
          "weaknesses": ["list"],
          "recommendation": "Strongly Recommend / Recommend / Consider / Reject",
          "feedback_amharic": "Summary feedback in Amharic",
          "feedback_english": "Summary feedback in English"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert recruitment evaluator." },
          { role: "user", content: prompt + "\n\nTranscript: " + JSON.stringify(fullTranscript) }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logAI('error', 'Evaluation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * 3. Resume/CV Analysis
   */
  async analyzeResume(resumeText, jobRequirements) {
    try {
      const prompt = `
        Analyze the candidate's resume against these requirements: ${JSON.stringify(jobRequirements)}.
        Identify matching skills, gaps, and an overall match percentage.
        Return JSON object with match_score, matched_skills, missing_skills, and experience_relevance.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert ATS (Applicant Tracking System)." },
          { role: "user", content: `Resume Content: ${resumeText} \n\n ${prompt}` }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logAI('error', 'Resume analysis failed', { error: error.message });
      throw error;
    }
  }

  // Health check for Admin Dashboard
  async checkAvailability() {
    if (!openai) return { available: false, reason: 'No API Key' };
    try {
      await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 5
      });
      return { available: true, status: 'operational' };
    } catch (e) {
      return { available: false, reason: e.message };
    }
  }
}

module.exports = new AIService();