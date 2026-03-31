import api from '../utils/api';

export const helpCenterAPI = {
  // Get all articles
  getArticles: async (category?: string, search?: string) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      
      const response = await api.get(`/help-center/articles?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  },

  // Get article by ID
  getArticleById: async (id: string) => {
    try {
      const response = await api.get(`/help-center/articles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching article:', error);
      throw error;
    }
  },

  // Mark article as helpful
  markArticleHelpful: async (id: string, helpful: boolean) => {
    try {
      const response = await api.post(`/help-center/articles/${id}/helpful`, { helpful });
      return response.data;
    } catch (error) {
      console.error('Error marking article:', error);
      throw error;
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await api.get('/help-center/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Submit support ticket
  submitSupportTicket: async (subject: string, message: string, category: string) => {
    try {
      const response = await api.post('/help-center/support-ticket', {
        subject,
        message,
        category
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      throw error;
    }
  }
};
