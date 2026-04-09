import { useState, useEffect, useCallback } from 'react';
import { helpCenterAPI } from '../services/helpCenterService';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  views: number;
  helpful: number;
  createdAt: Date;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

export const useHelpCenter = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch articles
  const fetchArticles = useCallback(async (category?: string, search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await helpCenterAPI.getArticles(category, search);
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || response.data || []);
      setArticles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch articles');
      console.error('Error fetching articles:', err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await helpCenterAPI.getCategories();
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || response.data || []);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  }, []);

  // Mark article as helpful
  const markHelpful = useCallback(async (articleId: string, helpful: boolean) => {
    try {
      await helpCenterAPI.markArticleHelpful(articleId, helpful);
      // Update local state
      setArticles(prev => prev.map(a => 
        a.id === articleId 
          ? { ...a, helpful: a.helpful + (helpful ? 1 : -1) }
          : a
      ));
    } catch (err: any) {
      console.error('Error marking article:', err);
    }
  }, []);

  // Submit support ticket
  const submitTicket = useCallback(async (subject: string, message: string, category: string) => {
    try {
      const response = await helpCenterAPI.submitSupportTicket(subject, message, category);
      return response.data;
    } catch (err: any) {
      throw err;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [fetchArticles, fetchCategories]);

  return {
    articles,
    categories,
    loading,
    error,
    fetchArticles,
    fetchCategories,
    markHelpful,
    submitTicket
  };
};
