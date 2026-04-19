import { useState, useEffect, useCallback, useRef } from 'react';
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
  const loadingRef = useRef(false);

  // Fetch articles
  const fetchArticles = useCallback(async (category?: string, search?: string) => {
    // Prevent duplicate requests
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      const articles = await helpCenterAPI.getArticles(category, search);
      setArticles(Array.isArray(articles) ? articles : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch articles');
      console.error('Error fetching articles:', err);
      setArticles([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const categories = await helpCenterAPI.getCategories();
      setCategories(Array.isArray(categories) ? categories : []);
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
      return response;
    } catch (err: any) {
      throw err;
    }
  }, []);

  // Initial load - non-blocking with timeout
  useEffect(() => {
    // Use setTimeout to defer loading until after page render
    const timer = setTimeout(() => {
      // Load help center data in background without blocking
      Promise.all([
        fetchArticles().catch(() => {}),
        fetchCategories().catch(() => {})
      ]).catch(() => {
        // Silently fail - fallback data will be used
      });
    }, 500); // Delay to allow page to render first

    return () => clearTimeout(timer);
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
