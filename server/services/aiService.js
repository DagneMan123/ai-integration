const OpenAI = require('openai');
const { logAI, logger } = require('../utils/logger');

/**
 * SimuAI AI Service Logic
 * Provider: Groq Cloud (Llama 3)
 * Functions: Turn-based Interviewing, Final Evaluation, Resume Analysis, and Support Chat.
 */

let openai = null;

// Initialize OpenAI Client with Groq Base URL
if (process.env.GROQ_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
  });
} else {
  logger.error('CRITICAL ERROR: GROQ_API_KEY is missing in environment variables.');
}

const AI_MODEL = "llama-3.1-8b-instant";// Updated from deprecated llama3-8b-8192
const MOCK_MODE = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AI === 'true';

class AIService {
  /**
   * 1. Next Interview Step (Turn-by-turn logic)
   * Dynamically generates the next question based on the job and candidate history.
   */
  async getNextInterviewStep(jobDetails, transcript = [], currentCandidateResponse = "") {
    try {
      if (!openai && !MOCK_MODE) throw new Error('AI Engine not initialized');

      if (MOCK_MODE) {
        const step = transcript.length + 1;
        return {
          message: `[MOCK MODE] Question ${step}: Please explain your technical approach to building scalable systems.`,
          isFinished: step >= 5,
          currentStep: step
        };
      }

      const systemPrompt = `
        You are a Senior HR Specialist for the SimuAI platform.
        Current Job Role: ${jobDetails.title}.
        
        INSTRUCTIONS:
        1. Conduct a professional interview using English and Amharic.
        2. Ask only ONE technical or behavioral question at a time.
        3. Read the candidate's previous response and provide a brief acknowledgment or a deeper follow-up question.
        4. Conclude the interview with a thank you message after 6-8 questions.

        OUTPUT FORMAT (Strict JSON):
        {
          "message": "Your professional question or response",
          "isFinished": boolean,
          "currentStep": number
        }
      `;

      const messages = [
        { role: "system", content: systemPrompt },
        ...transcript.map(m => ({ role: m.role, content: m.content }))
      ];

      if (currentCandidateResponse) {
        messages.push({ role: "user", content: currentCandidateResponse });
      }

      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: messages,
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logAI('error', 'Interview generation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * 2. Final Evaluation (Scoring)
   * Analyzes the entire transcript to generate a performance report.
   */
  async evaluateFinalPerformance(jobDetails, fullTranscript) {
    try {
      if (MOCK_MODE) {
        return { 
          overall_score: 85, 
          recommendation: "Strongly Recommend", 
          summary: "Mock evaluation: Candidate showed great potential." 
        };
      }

      const prompt = `
        Evaluate this interview transcript for the position: ${jobDetails.title}.
        Assess technical skills, communication, and confidence.
        
        OUTPUT FORMAT (Strict JSON):
        {
          "overall_score": 0-100,
          "technical_score": 0-100,
          "communication_score": 0-100,
          "strengths": ["list"],
          "weaknesses": ["list"],
          "recommendation": "Strongly Recommend / Recommend / Consider / Reject",
          "feedback_summary": "Detailed English feedback",
          "local_feedback": "Detailed Amharic feedback"
        }
      `;

      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: "You are an expert recruitment analyst." },
          { role: "user", content: prompt + "\n\nTranscript: " + JSON.stringify(fullTranscript) }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logAI('error', 'Evaluation process failed', { error: error.message });
      throw error;
    }
  }

  /**
   * 3. Resume / CV Matching
   */
  async analyzeResume(resumeText, jobRequirements) {
    try {
      if (MOCK_MODE) return { match_score: 90, status: "mock_success" };

      const prompt = `
        Compare the following resume text against these job requirements: ${JSON.stringify(jobRequirements)}.
        Identify matched skills, missing requirements, and a match percentage.
        Return strictly valid JSON.
      `;

      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: "You are an ATS parsing specialist." },
          { role: "user", content: `Resume Content: ${resumeText} \n\n ${prompt}` }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logAI('error', 'Resume analysis engine failed', { error: error.message });
      throw error;
    }
  }

  /**
   * 4. Smart Chat Assistant (Support & Coaching)
   * This handles the general user interaction on the dashboard.
   */
  async chatWithAI(userMessage, conversationHistory = []) {
    try {
      if (!openai && !MOCK_MODE) throw new Error('AI Engine unavailable');

      const systemPrompt = `
        You are the SimuAI Support Assistant. 
        - Your goal is to help users prepare for job interviews.
        - Respond in the language used by the user (English or Amharic).
        - If a user asks a general question (e.g., "Tell me about yourself" or "What is Physics?"), provide a concise answer then pivot the conversation back to their career or interview preparation.
        - If the user asks to start an interview or act as a recruiter, acknowledge it and guide them to the interview section.
      `;

      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage }
      ];

      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: messages,
        temperature: 0.8
      });

      return response.choices[0].message.content;
    } catch (error) {
      logAI('error', 'Chat assistant failed', { error: error.message });
      return "I encountered a technical issue. Please try again or switch to the main interview section.";
    }
  }

  /**
   * Platform Health Monitor
   */
  async checkAvailability() {
    if (!openai && !MOCK_MODE) return { available: false, reason: 'Keys missing' };
    try {
      if (MOCK_MODE) return { available: true, status: 'mock_active' };
      await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 5
      });
      return { available: true, status: 'online' };
    } catch (e) {
      return { available: false, reason: e.message };
    }
  }
}

module.exports = new AIService();