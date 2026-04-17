/**
 * Interview Session Service
 * Handles API calls for professional interview sessions
 */

import api from '../utils/api';

interface Question {
  id: number;
  text: string;
  category: 'technical' | 'behavioral' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedKeywords?: string[];
}

interface JobDetails {
  jobId?: string;
  title: string;
  company: string;
  experienceLevel?: string;
  requiredSkills?: string[];
}

interface Evaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
  keywordsFound: string[];
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
}

interface InterviewResponse {
  questionId: number;
  question: string;
  response: string;
  category: string;
  difficulty: string;
  evaluation?: Evaluation;
}

interface InterviewSummary {
  overallScore: number;
  recommendation: 'strong' | 'moderate' | 'weak';
  topStrengths: string[];
  areasForGrowth: string[];
  summary: string;
  nextSteps: string;
}

class InterviewSessionService {
  /**
   * Generate interview questions
   */
  async generateQuestions(jobDetails: JobDetails): Promise<Question[]> {
    try {
      const response = await api.post('/interview-session/generate-questions', jobDetails);
      return response.data.data;
    } catch (error: any) {
      console.error('Error generating questions:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate questions');
    }
  }

  /**
   * Evaluate candidate response
   */
  async evaluateResponse(
    question: Question,
    response: string,
    jobDetails: JobDetails
  ): Promise<Evaluation> {
    try {
      const payload = {
        question,
        response,
        jobDetails
      };
      const result = await api.post('/interview-session/evaluate-response', payload);
      return result.data.data;
    } catch (error: any) {
      console.error('Error evaluating response:', error);
      throw new Error(error.response?.data?.message || 'Failed to evaluate response');
    }
  }

  /**
   * Generate interviewer persona response
   */
  async generatePersonaResponse(
    question: Question,
    candidateResponse: string,
    evaluation: Evaluation
  ): Promise<string> {
    try {
      const payload = {
        question,
        candidateResponse,
        evaluation
      };
      const result = await api.post('/interview-session/persona-response', payload);
      return result.data.data.response;
    } catch (error: any) {
      console.error('Error generating persona response:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate persona response');
    }
  }

  /**
   * Generate interview summary
   */
  async generateInterviewSummary(
    responses: InterviewResponse[],
    jobDetails: JobDetails
  ): Promise<InterviewSummary> {
    try {
      const payload = {
        responses,
        jobDetails
      };
      const result = await api.post('/interview-session/summary', payload);
      return result.data.data;
    } catch (error: any) {
      console.error('Error generating summary:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate summary');
    }
  }

  /**
   * Simulate speech synthesis for question
   */
  speakQuestion(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 1;

          utterance.onend = () => resolve();
          utterance.onerror = (error) => reject(error);

          window.speechSynthesis.speak(utterance);
        } else {
          reject(new Error('Speech synthesis not supported'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop speech synthesis
   */
  stopSpeech(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const interviewSessionService = new InterviewSessionService();
