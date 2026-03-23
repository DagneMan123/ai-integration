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

// Mock responses for development when quota is exceeded
const MOCK_MODE = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AI === 'true';

class AIService {
  /**
   * 1. Start or Continue an Interview (Turn-by-turn logic)
   * This handles bilingual (Amharic & English) interaction.
   */
  async getNextInterviewStep(jobDetails, transcript = [], currentCandidateResponse = "") {
    try {
      if (!openai && !MOCK_MODE) throw new Error('AI Service not configured');

      // Use mock response if in mock mode
      if (MOCK_MODE) {
        const step = transcript.length + 1;
        const questions = [
          "Tell me about your experience with this technology stack.",
          "How do you approach problem-solving in your projects?",
          "Describe a challenging project you've worked on.",
          "How do you handle working in a team environment?",
          "What are your career goals for the next 5 years?"
        ];
        
        return {
          message: questions[Math.min(step - 1, questions.length - 1)] || "Thank you for the interview!",
          isFinished: step > 5,
          currentStep: step
        };
      }

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
      if (MOCK_MODE) {
        return {
          overall_score: 78,
          technical_score: 82,
          communication_score: 75,
          strengths: ["Good technical knowledge", "Clear communication", "Problem-solving skills"],
          weaknesses: ["Limited experience with specific framework", "Could improve on system design"],
          recommendation: "Recommend",
          feedback_amharic: "ጥሩ ውጤት ያሳየዋል",
          feedback_english: "Good performance demonstrated"
        };
      }

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
      if (MOCK_MODE) {
        return {
          match_score: 85,
          matched_skills: ["JavaScript", "React", "Node.js"],
          missing_skills: ["TypeScript", "Docker"],
          experience_relevance: "High - 5+ years relevant experience"
        };
      }

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
    if (MOCK_MODE) return { available: true, status: 'mock_mode', reason: 'Running in mock mode for development' };
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

  /**
   * 4. Chatbot Conversation
   */
  async chatWithAI(userMessage, conversationHistory = []) {
    try {
      if (!openai && !MOCK_MODE) throw new Error('AI Service not configured');

      if (MOCK_MODE) {
        const mockResponses = {
          'hello': 'Hi! I\'m SimuAI Assistant. How can I help you today?',
          'help': 'I can help you with interview preparation, job search guidance, and career advice.',
          'interview': 'Interview preparation is key! Practice common questions, research the company, and prepare examples of your achievements.',
          'default': 'That\'s a great question! I\'m here to help with interview prep and career guidance. What would you like to know?'
        };
        
        const key = userMessage.toLowerCase().split(' ')[0];
        return mockResponses[key] || mockResponses['default'];
      }

      const systemPrompt = `
        You are SimuAI Assistant, a helpful and friendly AI assistant for the SimuAI platform.
        You help users with:
        - Interview preparation and tips
        - Job search guidance
        - Career advice
        - Platform features and how to use them
        - General questions about interviews and hiring
        
        Be conversational, helpful, and professional. Keep responses concise and clear.
        If asked about something outside your scope, politely redirect to relevant topics.
      `;

      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: "user", content: userMessage }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      });

      const assistantMessage = response.choices[0].message.content;
      logAI('info', 'Chat response generated', { userMessage, responseLength: assistantMessage.length });

      return assistantMessage;
    } catch (error) {
      logAI('error', 'Chat failed', { error: error.message });
      throw error;
    }
  }
}

module.exports = new AIService();
