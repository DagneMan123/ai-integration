import api from '../utils/api';

/**
 * AI Interview Service
 * Handles AI-powered interview features including:
 * - Video interview recording and analysis
 * - AI question generation
 * - Real-time feedback
 * - Performance scoring
 */

export const aiInterviewService = {
  // Generate AI questions based on job description
  generateQuestions: async (jobId: number, difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    try {
      const response = await api.post('/ai/generate-questions', {
        jobId,
        difficulty,
        count: 5
      });
      return response.data;
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  },

  // Start video interview session
  startVideoInterview: async (interviewId: number) => {
    try {
      const response = await api.post('/ai/video-interview/start', {
        interviewId,
        recordingEnabled: true,
        aiProctoring: true
      });
      return response.data;
    } catch (error) {
      console.error('Error starting video interview:', error);
      throw error;
    }
  },

  // Submit video response
  submitVideoResponse: async (interviewId: number, questionId: number, videoBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('interviewId', interviewId.toString());
      formData.append('questionId', questionId.toString());
      formData.append('video', videoBlob, 'response.webm');

      const response = await api.post('/ai/video-interview/submit-response', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting video response:', error);
      throw error;
    }
  },

  // Get AI analysis of video response
  analyzeVideoResponse: async (interviewId: number, questionId: number) => {
    try {
      const response = await api.get(`/ai/video-interview/${interviewId}/analysis/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Error analyzing video response:', error);
      throw error;
    }
  },

  // Get real-time feedback during interview
  getRealTimeFeedback: async (interviewId: number) => {
    try {
      const response = await api.get(`/ai/video-interview/${interviewId}/feedback`);
      return response.data;
    } catch (error) {
      console.error('Error getting real-time feedback:', error);
      throw error;
    }
  },

  // Complete video interview and get final score
  completeVideoInterview: async (interviewId: number) => {
    try {
      const response = await api.post(`/ai/video-interview/${interviewId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing video interview:', error);
      throw error;
    }
  },

  // Get comprehensive interview report
  getInterviewReport: async (interviewId: number) => {
    try {
      const response = await api.get(`/ai/video-interview/${interviewId}/report`);
      return response.data;
    } catch (error) {
      console.error('Error getting interview report:', error);
      throw error;
    }
  },

  // AI-powered text interview
  startTextInterview: async (interviewId: number) => {
    try {
      const response = await api.post('/ai/text-interview/start', {
        interviewId,
        aiMode: true
      });
      return response.data;
    } catch (error) {
      console.error('Error starting text interview:', error);
      throw error;
    }
  },

  // Submit text answer
  submitTextAnswer: async (interviewId: number, questionId: number, answer: string) => {
    try {
      const response = await api.post('/ai/text-interview/submit-answer', {
        interviewId,
        questionId,
        answer
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting text answer:', error);
      throw error;
    }
  },

  // Get AI feedback on text answer
  getTextFeedback: async (interviewId: number, questionId: number) => {
    try {
      const response = await api.get(`/ai/text-interview/${interviewId}/feedback/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting text feedback:', error);
      throw error;
    }
  },

  // Detect cheating/suspicious behavior
  reportSuspiciousActivity: async (interviewId: number, activityType: string, details: any) => {
    try {
      const response = await api.post('/ai/anti-cheat/report', {
        interviewId,
        activityType,
        details,
        timestamp: new Date()
      });
      return response.data;
    } catch (error) {
      console.error('Error reporting suspicious activity:', error);
      throw error;
    }
  },

  // Get interview insights and recommendations
  getInterviewInsights: async (interviewId: number) => {
    try {
      const response = await api.get(`/ai/interview/${interviewId}/insights`);
      return response.data;
    } catch (error) {
      console.error('Error getting interview insights:', error);
      throw error;
    }
  }
};
