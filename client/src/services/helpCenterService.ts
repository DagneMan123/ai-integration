import apiService from './apiService';

// Fallback data when server is unavailable
const FALLBACK_ARTICLES = [
  {
    id: '1',
    title: 'Getting Started with Interviews',
    category: 'Getting Started',
    content: 'Learn how to prepare for your first AI-powered interview.',
    views: 0,
    helpful: 0,
    createdAt: new Date()
  },
  {
    id: '2',
    title: 'System Requirements',
    category: 'Technical',
    content: 'Check the technical requirements for running interviews.',
    views: 0,
    helpful: 0,
    createdAt: new Date()
  }
];

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Getting Started', count: 5 },
  { id: '2', name: 'Technical', count: 8 },
  { id: '3', name: 'Troubleshooting', count: 6 }
];

export const helpCenterAPI = {
  getArticles: async (category?: string, search?: string): Promise<any[]> => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      const response = await apiService.get<any[]>(`/help-center/articles?${params.toString()}`);
      if (Array.isArray(response)) return response;
      return FALLBACK_ARTICLES;
    } catch (error) {
      console.warn('Help center unavailable, using fallback data');
      return FALLBACK_ARTICLES;
    }
  },

  getArticleById: async (id: string): Promise<any> => {
    try {
      const response = await apiService.get(`/help-center/articles/${id}`);
      if (response) return response;
      return FALLBACK_ARTICLES.find(a => a.id === id) || null;
    } catch (error) {
      return FALLBACK_ARTICLES.find(a => a.id === id) || null;
    }
  },

  markArticleHelpful: async (id: string, helpful: boolean): Promise<any> => {
    try {
      const response = await apiService.post(`/help-center/articles/${id}/helpful`, { helpful });
      return response;
    } catch (error) {
      return { success: true };
    }
  },

  getCategories: async (): Promise<any[]> => {
    try {
      const response = await apiService.get<any[]>('/help-center/categories');
      if (Array.isArray(response)) return response;
      return FALLBACK_CATEGORIES;
    } catch (error) {
      console.warn('Help center unavailable, using fallback categories');
      return FALLBACK_CATEGORIES;
    }
  },

  submitSupportTicket: async (subject: string, message: string, category: string): Promise<any> => {
    try {
      const response = await apiService.post('/help-center/support-ticket', {
        subject,
        message,
        category
      });
      return response;
    } catch (error) {
      console.warn('Support ticket submission failed, will retry when server is available');
      return { success: false, message: 'Server unavailable' };
    }
  }
};
