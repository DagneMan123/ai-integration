import api from '../utils/api';

export const helpCenterAPI = {
  getArticles: async (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const response = await api.get(`/help-center/articles?${params.toString()}`);
    return response.data;
  },

  getArticleById: async (id: string) => {
    const response = await api.get(`/help-center/articles/${id}`);
    return response.data;
  },

  markArticleHelpful: async (id: string, helpful: boolean) => {
    const response = await api.post(`/help-center/articles/${id}/helpful`, { helpful });
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/help-center/categories');
    return response.data;
  },

  submitSupportTicket: async (subject: string, message: string, category: string) => {
    const response = await api.post('/help-center/support-ticket', {
      subject,
      message,
      category
    });
    return response.data;
  }
};
