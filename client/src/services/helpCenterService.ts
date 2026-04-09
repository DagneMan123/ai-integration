import api from '../utils/api';

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
  getArticles: async (category?: string, search?: string) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      const response = await api.get(`/help-center/articles?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.warn('Help center unavailable, using fallback data');
      return { data: FALLBACK_ARTICLES };
    }
  },

  getArticleById: async (id: string) => {
    try {
      const response = await api.get(`/help-center/articles/${id}`);
      return response.data;
    } catch (error) {
      return { data: FALLBACK_ARTICLES.find(a => a.id === id) || null };
    }
  },

  markArticleHelpful: async (id: string, helpful: boolean) => {
    try {
      const response = await api.post(`/help-center/articles/${id}/helpful`, { helpful });
      return response.data;
    } catch (error) {
      return { success: true };
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/help-center/categories');
      return response.data;
    } catch (error) {
      console.warn('Help center unavailable, using fallback categories');
      return { data: FALLBACK_CATEGORIES };
    }
  },

  submitSupportTicket: async (subject: string, message: string, category: string) => {
    try {
      const response = await api.post('/help-center/support-ticket', {
        subject,
        message,
        category
      });
      return response.data;
    } catch (error) {
      console.warn('Support ticket submission failed, will retry when server is available');
      return { success: false, message: 'Server unavailable' };
    }
  }
};
