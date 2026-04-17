const OpenAI = require('openai');
const { logAI, logger } = require('../utils/logger');

/**
 * 3-PHASE INTERVIEW SYSTEM (10+ QUESTIONS)
 * Phase 1 (Turn 1): Intro - Professional introduction with Amharic greeting
 * Phase 2 (Turns 2-9): Technical - 8 targeted technical questions based on job details
 * Phase 3 (Turn 10): Finish - Closing summary and completion
 */

class InterviewPhaseManager {
  generateIntroQuestion() {
    return {
      turn: 1,
      phase: 'INTRO',
      text: `ሰላም! (Selam - Hello!) Welcome to our professional interview. 
      
Please provide a professional introduction about yourself in English. Include:
1. Your name and current role
2. Your professional background (2-3 years of experience)
3. Your key skills relevant to this position
4. Why you're interested in this opportunity

Take your time and speak clearly.`,
      type: 'intro',
      timeLimit: 300,
      minLength: 50
    };
  }

  generateTechnicalQuestions(jobTitle) {
    const technicalQuestions = {
      'Senior Full Stack Developer': [
        {
          turn: 2,
          phase: 'TECHNICAL',
          text: 'Describe your experience with React and Node.js. What are the key differences between class components and functional components with hooks?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 3,
          phase: 'TECHNICAL',
          text: 'Explain your approach to database design. How would you optimize a complex SQL query with multiple joins?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 4,
          phase: 'TECHNICAL',
          text: 'Tell us about a challenging bug you fixed. What was your debugging process and what did you learn?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 5,
          phase: 'TECHNICAL',
          text: 'How do you approach API design? What REST principles do you follow and why?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 6,
          phase: 'TECHNICAL',
          text: 'Describe your experience with deployment and DevOps. How do you ensure code quality before production?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 7,
          phase: 'TECHNICAL',
          text: 'How do you handle scalability challenges? Can you describe a system you designed that handles high traffic?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 8,
          phase: 'TECHNICAL',
          text: 'What is your experience with microservices architecture? What are the benefits and challenges?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 9,
          phase: 'TECHNICAL',
          text: 'Tell us about your experience with testing and CI/CD pipelines. How do you ensure code reliability?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        }
      ],
      'Frontend Developer': [
        {
          turn: 2,
          phase: 'TECHNICAL',
          text: 'Explain the component lifecycle in React. How do hooks change the way you manage state and side effects?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 3,
          phase: 'TECHNICAL',
          text: 'How do you optimize frontend performance? What tools do you use to measure and improve it?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 4,
          phase: 'TECHNICAL',
          text: 'Describe your experience with CSS. How do you handle responsive design and cross-browser compatibility?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 5,
          phase: 'TECHNICAL',
          text: 'Tell us about your experience with state management. Why would you choose Redux, Context API, or other solutions?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 6,
          phase: 'TECHNICAL',
          text: 'How do you approach testing in frontend development? What testing frameworks and strategies do you use?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 7,
          phase: 'TECHNICAL',
          text: 'Describe your experience with accessibility (a11y). How do you ensure your applications are accessible to all users?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 8,
          phase: 'TECHNICAL',
          text: 'How do you handle browser compatibility issues? What tools and techniques do you use?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 9,
          phase: 'TECHNICAL',
          text: 'Tell us about a complex UI component you built. How did you approach the design and implementation?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        }
      ],
      'Backend Developer': [
        {
          turn: 2,
          phase: 'TECHNICAL',
          text: 'Explain your experience with backend frameworks. How do you structure a scalable API?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 3,
          phase: 'TECHNICAL',
          text: 'Describe your database experience. How do you handle data modeling and relationships?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 4,
          phase: 'TECHNICAL',
          text: 'How do you approach authentication and authorization? What security best practices do you follow?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 5,
          phase: 'TECHNICAL',
          text: 'Tell us about your experience with caching and performance optimization at scale.',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 6,
          phase: 'TECHNICAL',
          text: 'How do you handle error handling and logging in production systems?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 7,
          phase: 'TECHNICAL',
          text: 'Describe your experience with message queues and asynchronous processing. When would you use them?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 8,
          phase: 'TECHNICAL',
          text: 'How do you approach database migrations and schema changes in production?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        },
        {
          turn: 9,
          phase: 'TECHNICAL',
          text: 'Tell us about your experience with monitoring and alerting. How do you ensure system reliability?',
          type: 'technical',
          timeLimit: 300,
          minLength: 50
        }
      ]
    };

    return technicalQuestions[jobTitle] || technicalQuestions['Senior Full Stack Developer'];
  }

  generateFinishQuestion() {
    return {
      turn: 10,
      phase: 'FINISH',
      text: `Thank you for your comprehensive responses! Before we conclude, do you have any questions for us about the role, team, company culture, or career growth opportunities?`,
      type: 'closing',
      timeLimit: 300,
      minLength: 0,
      isFinished: true
    };
  }

  getQuestionForTurn(turnNumber, jobTitle) {
    if (turnNumber === 1) {
      return this.generateIntroQuestion();
    } else if (turnNumber >= 2 && turnNumber <= 9) {
      const technicalQuestions = this.generateTechnicalQuestions(jobTitle);
      return technicalQuestions[turnNumber - 2];
    } else if (turnNumber === 10) {
      return this.generateFinishQuestion();
    }
    return null;
  }

  scoreResponse(turn, response, phase) {
    let score = 0;
    const responseLength = response.trim().length;
    const wordCount = response.trim().split(/\s+/).length;

    // Length scoring
    if (responseLength < 50) {
      score += 20;
    } else if (responseLength < 200) {
      score += 50;
    } else if (responseLength < 500) {
      score += 75;
    } else {
      score += 85;
    }

    // Grammar and clarity scoring
    const sentenceCount = response.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;

    if (avgSentenceLength > 8 && avgSentenceLength < 20) {
      score += 10;
    }

    // Phase-specific scoring
    if (phase === 'INTRO') {
      const hasName = /my name|i'm|i am/i.test(response);
      const hasBackground = /experience|background|years|worked/i.test(response);
      const hasSkills = /skills|expertise|proficient|experienced/i.test(response);

      if (hasName) score += 5;
      if (hasBackground) score += 5;
      if (hasSkills) score += 5;
    } else if (phase === 'TECHNICAL') {
      const hasTechnicalTerms = /api|database|framework|algorithm|optimization|architecture/i.test(response);
      const hasExamples = /example|project|implemented|built|developed/i.test(response);

      if (hasTechnicalTerms) score += 5;
      if (hasExamples) score += 5;
    }

    return Math.min(100, score);
  }
}

const interviewPhaseManager = new InterviewPhaseManager();

/**
 * AIService: Handles all AI interactions for SimuAI.
 * Provider: Groq Cloud (Llama 3.1)
 */

let openai = null;

// Initialize OpenAI-compatible client for Groq
if (process.env.GROQ_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
  });
} else {
  logger.error('CRITICAL: GROQ_API_KEY is not defined in environment variables.');
}

const AI_MODEL = "llama-3.1-8b-instant";
const MOCK_MODE = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AI === 'true';

class AIService {
  /**
   * Generates intro questions (warm-up questions)
   */
  async generateIntroQuestions(jobDetails) {
    try {
      if (!openai && !MOCK_MODE) throw new Error('AI Engine not initialized');

      if (MOCK_MODE) {
        return {
          questions: [
            "Tell me about yourself and your professional background.",
            "What interests you about this position at our company?",
            "Can you describe your most recent role and key responsibilities?"
          ]
        };
      }

      const systemPrompt = `
        ROLE: Senior Technical Recruiter at SimuAI.
        POSITION: ${jobDetails.title}.
        COMPANY: ${jobDetails.company || 'Our Company'}.

        Generate 3 warm-up/intro questions to start the interview. These should be:
        - Open-ended and conversational
        - Help the candidate relax and get comfortable
        - Focus on background, motivation, and experience
        - NOT technical yet

        Return as JSON with array of questions.
      `;

      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate intro questions for ${jobDetails.title} position` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logAI('error', 'Intro questions generation failed', { error: error.message });
      throw new Error('Failed to generate intro questions.');
    }
  }

  /**
   * Generates detailed job-specific questions
   */
  async generateDetailedQuestions(jobDetails) {
    try {
      if (!openai && !MOCK_MODE) throw new Error('AI Engine not initialized');

      if (MOCK_MODE) {
        return {
          questions: [
            `Describe your experience with ${jobDetails.requiredSkills?.[0] || 'the required technologies'}.`,
            `How would you approach solving a complex problem in ${jobDetails.title}?`,
            `Tell us about a challenging project you've worked on related to this role.`,
            `What are your strengths and how do they apply to this position?`,
            `Where do you see yourself in 2-3 years in your career?`
          ]
        };
      }

      const systemPrompt = `
        ROLE: Senior Technical Recruiter at SimuAI.
        POSITION: ${jobDetails.title}.
        REQUIRED SKILLS: ${jobDetails.requiredSkills?.join(', ') || 'Software Engineering'}.
        EXPERIENCE LEVEL: ${jobDetails.experienceLevel || 'Mid-level'}.

        Generate 5 detailed, job-specific technical questions. These should:
        - Focus on the required skills and experience
        - Be challenging but fair
        - Assess technical depth and problem-solving
        - Be specific to the job requirements
        - Help evaluate if candidate is a good fit

        Return as JSON with array of questions.
      `;

      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate detailed questions for ${jobDetails.title} position` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logAI('error', 'Detailed questions generation failed', { error: error.message });
      throw new Error('Failed to generate detailed questions.');
    }
  }

  /**
   * Generates the next question in the interview sequence.
   * Logic: Bilingual greeting, English-only technical depth.
   */
  async getNextInterviewStep(jobDetails, transcript = [], currentCandidateResponse = "") {
    try {
      if (!openai && !MOCK_MODE) throw new Error('AI Engine not initialized');

      if (MOCK_MODE) {
        return {
          message: `[MOCK] Welcome. Step ${transcript.length + 1}: Can you explain the difference between SQL and NoSQL?`,
          isFinished: transcript.length >= 5,
          currentStep: transcript.length + 1
        };
      }

      const systemPrompt = `
        ROLE: Senior Technical Recruiter at SimuAI.
        POSITION: ${jobDetails.title}.
        TARGET SKILLS: ${jobDetails.requiredSkills || 'Software Engineering'}.

        COMMUNICATION PROTOCOL:
        1. Greet the candidate briefly in Amharic (Ethiopic script).
        2. Conduct the technical interview STRICTLY in English. 
        3. Acknowledge previous responses briefly before asking the next question.
        4. Focus on deep technical concepts related to the job position.
        5. Ask exactly ONE question per turn.
        6. Set "isFinished" to true after a total of 6-8 questions.

        STRICT JSON FORMAT REQUIRED:
        {
          "message": "Polite Amharic Greeting + English Technical Question",
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
        temperature: 0.6
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logAI('error', 'Interview step generation failed', { error: error.message });
      throw new Error('Failed to generate interview question.');
    }
  }

  /**
   * Analyzes the entire interview transcript to provide a final report.
   */
  async evaluateFinalPerformance(jobDetails, fullTranscript) {
    try {
      if (MOCK_MODE) {
        return {
          overall_score: 80,
          technical_score: 82,
          communication_score: 78,
          confidence_score: 75,
          problem_solving_score: 80,
          strengths: ['Clear communication', 'Strong technical knowledge', 'Problem-solving ability'],
          weaknesses: ['Could provide more examples', 'Could elaborate on edge cases'],
          recommendation: 'Recommend',
          feedback_summary: 'Good technical skills and communication.',
          hiringDecision: 'recommended'
        };
      }

      const prompt = `
        Perform a comprehensive evaluation for the role: ${jobDetails.title}.
        Analyze the provided transcript for technical accuracy, communication clarity, and confidence.
        
        IMPORTANT: Return ONLY valid JSON with these exact fields and types:
        {
          "overall_score": <number 0-100>,
          "technical_score": <number 0-100>,
          "communication_score": <number 0-100>,
          "confidence_score": <number 0-100>,
          "problem_solving_score": <number 0-100>,
          "strengths": [<string>, <string>, <string>],
          "weaknesses": [<string>, <string>],
          "recommendation": "<string: Strongly Recommend | Recommend | Consider | Reject>",
          "feedback_summary": "<string: detailed feedback>",
          "hiringDecision": "<string: recommended | under_review | not_recommended>"
        }
      `;

      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: "You are an expert recruitment analyst. Return ONLY valid JSON, no markdown, no extra text." },
          { role: "user", content: `${prompt}\n\nTranscript: ${JSON.stringify(fullTranscript)}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      // Validate and normalize the response
      return {
        overall_score: parseInt(result.overall_score) || 0,
        technical_score: parseInt(result.technical_score) || 0,
        communication_score: parseInt(result.communication_score) || 0,
        confidence_score: parseInt(result.confidence_score) || 0,
        problem_solving_score: parseInt(result.problem_solving_score) || 0,
        strengths: Array.isArray(result.strengths) ? result.strengths : [],
        weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
        recommendation: result.recommendation || 'Consider',
        feedback_summary: result.feedback_summary || 'Interview completed',
        hiringDecision: result.hiringDecision || 'under_review'
      };
    } catch (error) {
      logAI('error', 'Final evaluation failed', { error: error.message });
      throw new Error('Failed to generate performance report.');
    }
  }

  /**
   * Analyzes a Resume against Job Requirements.
   */
  async analyzeResume(resumeText, jobRequirements) {
    try {
      if (MOCK_MODE) return { match_score: 75, summary: "Mock analysis successful." };

      const prompt = `
        Compare this resume text against the following job requirements: ${JSON.stringify(jobRequirements)}.
        Calculate a match percentage and identify missing key skills.
      `;

      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: "You are an ATS (Applicant Tracking System) optimizer." },
          { role: "user", content: `Resume: ${resumeText}\n\n${prompt}` }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logAI('error', 'Resume analysis failed', { error: error.message });
      throw new Error('AI analysis of the resume failed.');
    }
  }

  /**
   * General Support Assistant for users on the dashboard.
   */
  async chatWithAI(userMessage, conversationHistory = []) {
    try {
      if (!openai && !MOCK_MODE) throw new Error('AI unavailable');

      const systemPrompt = "You are the SimuAI Support Assistant. Help users with interview coaching. Respond in the user's language.";

      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: userMessage }
        ],
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      logAI('error', 'Assistant chat failed', { error: error.message });
      return "An error occurred. Please try again later.";
    }
  }

  /**
   * Service Health Monitoring
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
module.exports.interviewPhaseManager = interviewPhaseManager;