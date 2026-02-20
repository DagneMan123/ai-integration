const OpenAI = require('openai');
const { logAI } = require('../utils/logger');

// Initialize OpenAI client only if API key is provided
let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} else {
  console.warn('⚠️  OPENAI_API_KEY not set. AI features will be disabled.');
}

class AIService {
  // Generate interview questions based on job requirements
  async generateInterviewQuestions(jobDetails, questionCount = 10) {
    try {
      if (!openai) {
        logAI('warn', 'OpenAI not configured, returning default questions');
        return this.createDefaultQuestions('OpenAI API key not configured');
      }

      logAI('info', 'Generating interview questions', { 
        jobTitle: jobDetails.title,
        questionCount,
        interviewType: jobDetails.interview_type 
      });

      const prompt = this.buildQuestionPrompt(jobDetails, questionCount);
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert HR interviewer and technical recruiter. Generate professional interview questions that are relevant, challenging, and fair."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const questions = this.parseQuestions(response.choices[0].message.content);
      
      logAI('info', 'Interview questions generated successfully', { 
        questionsGenerated: questions.length 
      });

      return questions;
    } catch (error) {
      logAI('error', 'Failed to generate interview questions', { 
        error: error.message,
        jobTitle: jobDetails.title 
      });
      throw new Error('Failed to generate interview questions');
    }
  }

  // Evaluate candidate responses
  async evaluateResponses(questions, responses, jobDetails) {
    try {
      logAI('info', 'Evaluating candidate responses', { 
        questionsCount: questions.length,
        responsesCount: responses.length 
      });

      const prompt = this.buildEvaluationPrompt(questions, responses, jobDetails);
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert AI interviewer and evaluator. Provide fair, objective, and constructive evaluation of candidate responses. Be professional and unbiased."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      });

      const evaluation = this.parseEvaluation(response.choices[0].message.content);
      
      logAI('info', 'Response evaluation completed', { 
        overallScore: evaluation.overall_score 
      });

      return evaluation;
    } catch (error) {
      logAI('error', 'Failed to evaluate responses', { error: error.message });
      throw new Error('Failed to evaluate candidate responses');
    }
  }

  // Generate personalized feedback
  async generateFeedback(evaluation, candidateProfile) {
    try {
      const prompt = `
        Based on the following interview evaluation and candidate profile, provide personalized feedback and improvement suggestions:

        Evaluation Scores:
        - Overall: ${evaluation.overall_score}/100
        - Technical Skills: ${evaluation.technical_score}/100
        - Communication: ${evaluation.communication_score}/100
        - Problem Solving: ${evaluation.problem_solving_score}/100

        Candidate Profile:
        - Experience Level: ${candidateProfile.experience_level || 'Not specified'}
        - Skills: ${candidateProfile.skills ? candidateProfile.skills.join(', ') : 'Not specified'}

        Provide:
        1. Overall performance summary
        2. Key strengths (3-5 points)
        3. Areas for improvement (3-5 points)
        4. Specific actionable recommendations
        5. Learning resources suggestions

        Format the response in a professional, encouraging tone.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional career coach and mentor. Provide constructive, encouraging, and actionable feedback."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const feedback = response.choices[0].message.content;
      
      logAI('info', 'Feedback generated successfully');

      return {
        feedback,
        generated_at: new Date()
      };
    } catch (error) {
      logAI('error', 'Failed to generate feedback', { error: error.message });
      throw new Error('Failed to generate personalized feedback');
    }
  }

  // Analyze resume/CV
  async analyzeResume(resumeText, jobRequirements) {
    try {
      logAI('info', 'Analyzing resume against job requirements');

      const prompt = `
        Analyze the following resume against the job requirements and provide a detailed assessment:

        Job Requirements:
        ${JSON.stringify(jobRequirements, null, 2)}

        Resume/CV:
        ${resumeText}

        Provide:
        1. Match score (0-100)
        2. Matching skills
        3. Missing skills
        4. Experience relevance
        5. Recommendations for the candidate
        6. Red flags (if any)

        Format as JSON.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert resume analyzer and ATS system. Provide objective, detailed analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const analysis = this.parseResumeAnalysis(response.choices[0].message.content);
      
      logAI('info', 'Resume analysis completed', { matchScore: analysis.match_score });

      return analysis;
    } catch (error) {
      logAI('error', 'Failed to analyze resume', { error: error.message });
      throw new Error('Failed to analyze resume');
    }
  }

  // Build question generation prompt
  buildQuestionPrompt(jobDetails, questionCount) {
    return `
      Generate ${questionCount} professional interview questions for the following job position:

      Job Title: ${jobDetails.title}
      Job Type: ${jobDetails.job_type || 'Full-time'}
      Experience Level: ${jobDetails.experience_level || 'Mid-level'}
      Interview Type: ${jobDetails.interview_type || 'Technical'}
      
      Required Skills: ${jobDetails.required_skills ? jobDetails.required_skills.join(', ') : 'General skills'}
      
      Job Description:
      ${jobDetails.description || 'No description provided'}

      Requirements:
      1. Questions should be relevant to the job requirements
      2. Mix of technical and behavioral questions
      3. Appropriate difficulty level for the experience level
      4. Clear and unambiguous
      5. Professional and unbiased

      Format each question as:
      Q[number]: [Question text]
      Type: [Technical/Behavioral/Situational]
      Difficulty: [Easy/Medium/Hard]

      Generate the questions now.
    `;
  }

  // Build evaluation prompt
  buildEvaluationPrompt(questions, responses, jobDetails) {
    let qaText = '';
    questions.forEach((q, index) => {
      qaText += `\nQuestion ${index + 1}: ${q.question}\n`;
      qaText += `Candidate Response: ${responses[index]?.answer || 'No response provided'}\n`;
      qaText += `Expected Skills: ${q.expected_skills || 'General assessment'}\n`;
    });

    return `
      Evaluate the following interview responses for the position: ${jobDetails.title}

      ${qaText}

      Provide a comprehensive evaluation with:
      1. Overall Score (0-100)
      2. Technical Skills Score (0-100)
      3. Communication Score (0-100)
      4. Problem Solving Score (0-100)
      5. Individual question scores
      6. Strengths identified
      7. Weaknesses identified
      8. Detailed feedback for each response
      9. Hiring recommendation (Strongly Recommend/Recommend/Consider/Not Recommend)

      Be fair, objective, and constructive in your evaluation.
      Format the response as JSON.
    `;
  }

  // Parse questions from AI response
  parseQuestions(aiResponse) {
    try {
      const questions = [];
      const lines = aiResponse.split('\n');
      let currentQuestion = null;

      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Match question pattern: Q1:, Q2:, etc.
        const questionMatch = trimmedLine.match(/^Q(\d+):\s*(.+)/i);
        if (questionMatch) {
          if (currentQuestion) {
            questions.push(currentQuestion);
          }
          currentQuestion = {
            question_number: parseInt(questionMatch[1]),
            question: questionMatch[2],
            type: 'General',
            difficulty: 'Medium'
          };
        }
        
        // Match type
        const typeMatch = trimmedLine.match(/^Type:\s*(.+)/i);
        if (typeMatch && currentQuestion) {
          currentQuestion.type = typeMatch[1];
        }
        
        // Match difficulty
        const difficultyMatch = trimmedLine.match(/^Difficulty:\s*(.+)/i);
        if (difficultyMatch && currentQuestion) {
          currentQuestion.difficulty = difficultyMatch[1];
        }
      });

      // Add last question
      if (currentQuestion) {
        questions.push(currentQuestion);
      }

      // If parsing failed, create default questions
      if (questions.length === 0) {
        return this.createDefaultQuestions(aiResponse);
      }

      return questions;
    } catch (error) {
      logAI('error', 'Failed to parse questions', { error: error.message });
      return this.createDefaultQuestions(aiResponse);
    }
  }

  // Parse evaluation from AI response
  parseEvaluation(aiResponse) {
    try {
      // Try to parse as JSON first
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          overall_score: parsed.overall_score || parsed.overallScore || 70,
          technical_score: parsed.technical_score || parsed.technicalScore || 70,
          communication_score: parsed.communication_score || parsed.communicationScore || 70,
          problem_solving_score: parsed.problem_solving_score || parsed.problemSolvingScore || 70,
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
          recommendation: parsed.recommendation || 'Consider',
          detailed_feedback: parsed.detailed_feedback || parsed.detailedFeedback || aiResponse
        };
      }

      // Fallback: extract scores from text
      const overallMatch = aiResponse.match(/overall[:\s]+(\d+)/i);
      const technicalMatch = aiResponse.match(/technical[:\s]+(\d+)/i);
      const communicationMatch = aiResponse.match(/communication[:\s]+(\d+)/i);
      const problemMatch = aiResponse.match(/problem[:\s]+(\d+)/i);

      return {
        overall_score: overallMatch ? parseInt(overallMatch[1]) : 70,
        technical_score: technicalMatch ? parseInt(technicalMatch[1]) : 70,
        communication_score: communicationMatch ? parseInt(communicationMatch[1]) : 70,
        problem_solving_score: problemMatch ? parseInt(problemMatch[1]) : 70,
        strengths: [],
        weaknesses: [],
        recommendation: 'Consider',
        detailed_feedback: aiResponse
      };
    } catch (error) {
      logAI('error', 'Failed to parse evaluation', { error: error.message });
      return {
        overall_score: 70,
        technical_score: 70,
        communication_score: 70,
        problem_solving_score: 70,
        strengths: [],
        weaknesses: [],
        recommendation: 'Consider',
        detailed_feedback: aiResponse
      };
    }
  }

  // Parse resume analysis
  parseResumeAnalysis(aiResponse) {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        match_score: 70,
        matching_skills: [],
        missing_skills: [],
        experience_relevance: 'Moderate',
        recommendations: [],
        red_flags: []
      };
    } catch (error) {
      logAI('error', 'Failed to parse resume analysis', { error: error.message });
      return {
        match_score: 70,
        matching_skills: [],
        missing_skills: [],
        experience_relevance: 'Moderate',
        recommendations: [],
        red_flags: []
      };
    }
  }

  // Create default questions if parsing fails
  createDefaultQuestions(aiResponse) {
    const defaultQuestions = [
      {
        question_number: 1,
        question: "Tell me about your relevant experience for this position.",
        type: "Behavioral",
        difficulty: "Easy"
      },
      {
        question_number: 2,
        question: "What are your key technical skills?",
        type: "Technical",
        difficulty: "Easy"
      },
      {
        question_number: 3,
        question: "Describe a challenging project you worked on.",
        type: "Behavioral",
        difficulty: "Medium"
      },
      {
        question_number: 4,
        question: "How do you handle tight deadlines?",
        type: "Situational",
        difficulty: "Medium"
      },
      {
        question_number: 5,
        question: "What motivates you in your work?",
        type: "Behavioral",
        difficulty: "Easy"
      }
    ];

    logAI('warn', 'Using default questions due to parsing failure');
    return defaultQuestions;
  }

  // Generate job recommendations for candidates
  async generateJobRecommendations(candidateProfile, availableJobs) {
    try {
      logAI('info', 'Generating job recommendations', { 
        candidateSkills: candidateProfile.skills?.length || 0,
        availableJobs: availableJobs.length 
      });

      const prompt = `
        Based on the candidate profile and available jobs, recommend the best matching positions:

        Candidate Profile:
        - Experience Level: ${candidateProfile.experience_level || 'Not specified'}
        - Skills: ${candidateProfile.skills ? candidateProfile.skills.join(', ') : 'Not specified'}
        - Salary Expectation: ${candidateProfile.salary_expectation || 'Not specified'}
        - Availability: ${candidateProfile.availability || 'Not specified'}

        Available Jobs:
        ${availableJobs.map((job, i) => `
          ${i + 1}. ${job.title}
             Company: ${job.company?.name || 'Unknown'}
             Required Skills: ${job.requiredSkills?.join(', ') || 'Not specified'}
             Experience Level: ${job.experienceLevel || 'Not specified'}
             Salary Range: ${job.salaryMin || 'Not specified'} - ${job.salaryMax || 'Not specified'}
        `).join('\n')}

        Provide:
        1. Top 3 job recommendations with match scores (0-100)
        2. Why each job is a good fit
        3. Skills gaps to address
        4. Preparation tips for interviews

        Format as JSON with job_id, match_score, and reasons.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert career advisor. Provide personalized job recommendations based on candidate profiles and job requirements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const recommendations = this.parseJobRecommendations(response.choices[0].message.content);
      logAI('info', 'Job recommendations generated', { count: recommendations.length });
      return recommendations;
    } catch (error) {
      logAI('error', 'Failed to generate job recommendations', { error: error.message });
      throw new Error('Failed to generate job recommendations');
    }
  }

  // Generate cover letter
  async generateCoverLetter(candidateProfile, jobDetails) {
    try {
      logAI('info', 'Generating cover letter', { 
        jobTitle: jobDetails.title,
        candidateName: candidateProfile.firstName 
      });

      const prompt = `
        Generate a professional cover letter for the following:

        Candidate Information:
        - Name: ${candidateProfile.firstName} ${candidateProfile.lastName}
        - Experience Level: ${candidateProfile.experience_level || 'Not specified'}
        - Skills: ${candidateProfile.skills ? candidateProfile.skills.join(', ') : 'Not specified'}
        - Bio: ${candidateProfile.bio || 'Not specified'}

        Job Details:
        - Position: ${jobDetails.title}
        - Company: ${jobDetails.company?.name || 'Not specified'}
        - Description: ${jobDetails.description || 'Not specified'}
        - Required Skills: ${jobDetails.requiredSkills?.join(', ') || 'Not specified'}

        Generate a compelling, professional cover letter that:
        1. Highlights relevant experience
        2. Demonstrates knowledge of the company
        3. Shows enthusiasm for the role
        4. Addresses key job requirements
        5. Is 3-4 paragraphs long

        Make it personalized and impactful.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert cover letter writer. Create compelling, professional cover letters that help candidates stand out."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const coverLetter = response.choices[0].message.content;
      logAI('info', 'Cover letter generated successfully');
      return { coverLetter, generated_at: new Date() };
    } catch (error) {
      logAI('error', 'Failed to generate cover letter', { error: error.message });
      throw new Error('Failed to generate cover letter');
    }
  }

  // Analyze interview performance
  async analyzeInterviewPerformance(interviewData) {
    try {
      logAI('info', 'Analyzing interview performance');

      const prompt = `
        Analyze the following interview performance data and provide insights:

        Interview Data:
        - Duration: ${interviewData.duration || 'Not specified'} minutes
        - Questions Asked: ${interviewData.questionsCount || 0}
        - Responses Quality: ${interviewData.responseQuality || 'Not specified'}
        - Technical Score: ${interviewData.technicalScore || 0}/100
        - Communication Score: ${interviewData.communicationScore || 0}/100
        - Problem Solving Score: ${interviewData.problemSolvingScore || 0}/100
        - Overall Score: ${interviewData.overallScore || 0}/100

        Provide:
        1. Performance summary
        2. Key strengths demonstrated
        3. Areas needing improvement
        4. Specific feedback for each competency
        5. Recommendations for the candidate
        6. Hiring recommendation

        Be constructive and encouraging.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert interview analyst. Provide detailed, constructive analysis of interview performance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const analysis = response.choices[0].message.content;
      logAI('info', 'Interview performance analysis completed');
      return { analysis, analyzed_at: new Date() };
    } catch (error) {
      logAI('error', 'Failed to analyze interview performance', { error: error.message });
      throw new Error('Failed to analyze interview performance');
    }
  }

  // Generate skill development plan
  async generateSkillDevelopmentPlan(candidateProfile, targetSkills) {
    try {
      logAI('info', 'Generating skill development plan', { 
        targetSkillsCount: targetSkills.length 
      });

      const prompt = `
        Create a personalized skill development plan for the candidate:

        Current Profile:
        - Experience Level: ${candidateProfile.experience_level || 'Not specified'}
        - Current Skills: ${candidateProfile.skills ? candidateProfile.skills.join(', ') : 'Not specified'}
        - Learning Style: ${candidateProfile.learningStyle || 'Not specified'}

        Target Skills to Develop:
        ${targetSkills.join(', ')}

        Create a comprehensive plan that includes:
        1. Priority ranking of skills to learn
        2. Recommended learning resources (courses, books, projects)
        3. Timeline for skill development (3-6 months)
        4. Milestones and checkpoints
        5. Practice projects and exercises
        6. Success metrics

        Make it practical and achievable.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert career coach and learning strategist. Create personalized, achievable skill development plans."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      });

      const developmentPlan = response.choices[0].message.content;
      logAI('info', 'Skill development plan generated');
      return { developmentPlan, created_at: new Date() };
    } catch (error) {
      logAI('error', 'Failed to generate skill development plan', { error: error.message });
      throw new Error('Failed to generate skill development plan');
    }
  }

  // Parse job recommendations
  parseJobRecommendations(aiResponse) {
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      return [];
    } catch (error) {
      logAI('error', 'Failed to parse job recommendations', { error: error.message });
      return [];
    }
  }

  // Check if AI service is available
  async checkAvailability() {
    try {
      if (!openai) {
        return { available: false, reason: 'API key not configured' };
      }

      if (!process.env.OPENAI_API_KEY) {
        return { available: false, reason: 'API key not configured' };
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 5
      });

      return { 
        available: true, 
        model: response.model,
        message: 'AI service is operational' 
      };
    } catch (error) {
      logAI('error', 'AI service availability check failed', { error: error.message });
      return { 
        available: false, 
        reason: error.message 
      };
    }
  }
}

module.exports = new AIService();
