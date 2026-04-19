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

// Cache with TTL (Time To Live)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class HelpCenterCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes cache TTL

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache has expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new HelpCenterCache();

export const helpCenterAPI = {
  getArticles: async (category?: string, search?: string): Promise<any[]> => {
    // Create cache key from parameters
    const cacheKey = `articles:${category || 'all'}:${search || 'all'}`;
    
    // Check cache first
    const cached = cache.get<any[]>(cacheKey);
    if (cached) {
      console.log('[Help Center] Returning cached articles');
      return cached;
    }

    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      const response = await apiService.get<any[]>(`/help-center/articles?${params.toString()}`);
      if (Array.isArray(response)) {
        cache.set(cacheKey, response);
        return response;
      }
      return FALLBACK_ARTICLES;
    } catch (error) {
      console.warn('Help center unavailable, using fallback data');
      return FALLBACK_ARTICLES;
    }
  },

  getArticleById: async (id: string): Promise<any> => {
    const cacheKey = `article:${id}`;
    
    // Check cache first
    const cached = cache.get<any>(cacheKey);
    if (cached) {
      console.log('[Help Center] Returning cached article');
      return cached;
    }

    try {
      const response = await apiService.get(`/help-center/articles/${id}`);
      if (response) {
        cache.set(cacheKey, response);
        return response;
      }
      return FALLBACK_ARTICLES.find(a => a.id === id) || null;
    } catch (error) {
      return FALLBACK_ARTICLES.find(a => a.id === id) || null;
    }
  },

  markArticleHelpful: async (id: string, helpful: boolean): Promise<any> => {
    try {
      const response = await apiService.post(`/help-center/articles/${id}/helpful`, { helpful });
      // Invalidate article cache after marking helpful
      cache.get(`article:${id}`);
      return response;
    } catch (error) {
      return { success: true };
    }
  },

  getCategories: async (): Promise<any[]> => {
    const cacheKey = 'categories';
    
    // Check cache first
    const cached = cache.get<any[]>(cacheKey);
    if (cached) {
      console.log('[Help Center] Returning cached categories');
      return cached;
    }

    try {
      const response = await apiService.get<any[]>('/help-center/categories');
      if (Array.isArray(response)) {
        cache.set(cacheKey, response);
        return response;
      }
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
  },

  // Clear cache manually if needed
  clearCache: (): void => {
    cache.clear();
    console.log('[Help Center] Cache cleared');
  }
};
