/**
 * Interview Persona Service
 * Handles AI-powered interview questions and responses
 */

const axios = require('axios');
const { logger } = require('../utils/logger');

class InterviewPersonaService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  /**
   * Generate interview questions based on job details
   */
  async generateQuestions(jobDetails) {
    try {
      const prompt = `Generate 5 professional interview questions for a ${jobDetails.title} position at ${jobDetails.company}.
      
      Requirements:
      - Mix of technical, behavioral, and general questions
      - Appropriate difficulty level for ${jobDetails.experienceLevel} level
      - Focus on skills: ${jobDetails.requiredSkills?.join(', ') || 'general'}
      
      Return as JSON array with structure:
      [
        {
          "id": 1,
          "text": "question text",
          "category": "technical|behavioral|general",
          "difficulty": "easy|medium|hard",
          "expectedKeywords": ["keyword1", "keyword2"]
        }
      ]`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert technical interviewer. Generate professional interview questions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('Failed to parse questions from AI response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Error generating questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  /**
   * Evaluate candidate response
   */
  async evaluateResponse(question, candidateResponse, jobDetails) {
    try {
      const prompt = `Evaluate this interview response:
      
      Question: ${question.text}
      Category: ${question.category}
      Difficulty: ${question.difficulty}
      Expected Keywords: ${question.expectedKeywords?.join(', ') || 'N/A'}
      
      Candidate Response: "${candidateResponse}"
      
      Provide evaluation in JSON format:
      {
        "score": 0-100,
        "strengths": ["strength1", "strength2"],
        "improvements": ["improvement1", "improvement2"],
        "feedback": "detailed feedback",
        "keywordsFound": ["keyword1", "keyword2"],
        "communicationScore": 0-100,
        "technicalScore": 0-100,
        "confidenceScore": 0-100
      }`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert technical interviewer evaluating candidate responses. Provide constructive feedback.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Failed to parse evaluation from AI response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Error evaluating response:', error);
      throw new Error('Failed to evaluate response');
    }
  }

  /**
   * Generate interviewer persona response
   */
  async generatePersonaResponse(question, candidateResponse, evaluation) {
    try {
      const prompt = `As a professional interviewer, provide a brief response to the candidate's answer.
      
      Question: ${question.text}
      Candidate Response: "${candidateResponse}"
      Evaluation Score: ${evaluation.score}/100
      
      Generate a professional, encouraging response that:
      - Acknowledges their answer
      - Highlights one strength
      - Suggests one area for improvement (if needed)
      - Transitions to next question
      
      Keep response to 2-3 sentences maximum.`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional interviewer providing constructive feedback to candidates.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      logger.error('Error generating persona response:', error);
      throw new Error('Failed to generate persona response');
    }
  }

  /**
   * Generate overall interview summary
   */
  async generateInterviewSummary(allResponses, jobDetails) {
    try {
      const responseSummary = allResponses
        .map(r => `Q: ${r.question}\nA: ${r.response}\nScore: ${r.evaluation.score}/100`)
        .join('\n\n');

      const prompt = `Generate a professional interview summary:
      
      Position: ${jobDetails.title}
      Company: ${jobDetails.company}
      
      Responses and Scores:
      ${responseSummary}
      
      Provide summary in JSON format:
      {
        "overallScore": 0-100,
        "recommendation": "strong|moderate|weak",
        "topStrengths": ["strength1", "strength2"],
        "areasForGrowth": ["area1", "area2"],
        "summary": "paragraph summary",
        "nextSteps": "recommended next steps"
      }`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert technical interviewer summarizing interview performance.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 1200
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Failed to parse summary from AI response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Error generating summary:', error);
      throw new Error('Failed to generate interview summary');
    }
  }
}

module.exports = new InterviewPersonaService();
