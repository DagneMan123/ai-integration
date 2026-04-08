import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, ChevronDown, Mail, MessageSquare, BookOpen, Zap, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import { helpCenterAPI } from '../../services/helpCenterService';
import Loading from '../../components/Loading';

interface FAQItem {
  id: string | number;
  title?: string;
  question?: string;
  content?: string;
  answer?: string;
  category: string;
}

const HelpCenter: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await helpCenterAPI.getArticles();
        const articles = response.data || [];
        setFaqs(articles.map((article: any) => ({
          id: article.id,
          question: article.title,
          answer: article.content,
          category: article.category
        })));
      } catch (err: any) {
        console.error('Error fetching articles:', err);
        setError('Failed to load help articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white">
            <div className="flex items-start gap-4">
              <HelpCircle className="w-12 h-12 flex-shrink-0" />
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">Help Center</h1>
                <p className="text-blue-100 text-lg">Find answers to common questions and get support</p>
              </div>
            </div>
          </div>

          {loading && <Loading />}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Quick Links */}
              <div className="grid md:grid-cols-3 gap-6">
                <Link to="/candidate/getting-started" className="p-6 bg-blue-50 border border-blue-200 rounded-2xl hover:shadow-lg transition-all group">
                  <BookOpen className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-900 mb-2">Getting Started</h3>
                  <p className="text-sm text-gray-600">Learn how to set up your account and get started</p>
                  <ArrowRight className="w-4 h-4 text-blue-600 mt-3 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/candidate/interview-tips" className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl hover:shadow-lg transition-all group">
                  <Zap className="w-8 h-8 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-900 mb-2">Interview Tips</h3>
                  <p className="text-sm text-gray-600">Prepare and excel in your AI interviews</p>
                  <ArrowRight className="w-4 h-4 text-emerald-600 mt-3 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/candidate/troubleshooting" className="p-6 bg-purple-50 border border-purple-200 rounded-2xl hover:shadow-lg transition-all group">
                  <AlertCircle className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-900 mb-2">Troubleshooting</h3>
                  <p className="text-sm text-gray-600">Solve common technical issues</p>
                  <ArrowRight className="w-4 h-4 text-purple-600 mt-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Categories */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">Categories</h3>
                    <div className="space-y-2">
                      {['all', ...new Set(faqs.map(faq => faq.category))].map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                            selectedCategory === category
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {category === 'all' ? 'All Articles' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Support */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Still need help?</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold shadow-md hover:shadow-lg">
                        <Mail className="w-5 h-5" />
                        Email Support
                      </button>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all font-bold">
                        <MessageSquare className="w-5 h-5" />
                        Live Chat
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-4 text-center">Response time: Usually within 24 hours</p>
                  </div>
                </div>

                {/* FAQ List */}
                <div className="lg:col-span-3 space-y-4">
                  {faqs.filter(faq => {
                    const matchesSearch = (faq.question?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                         (faq.answer?.toLowerCase() || '').includes(searchTerm.toLowerCase());
                    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
                    return matchesSearch && matchesCategory;
                  }).length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                      <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-bold text-lg">No articles found</p>
                      <p className="text-gray-400 mt-2">Try a different search term or browse other categories</p>
                    </div>
                  ) : (
                    faqs.filter(faq => {
                      const matchesSearch = (faq.question?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                           (faq.answer?.toLowerCase() || '').includes(searchTerm.toLowerCase());
                      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
                      return matchesSearch && matchesCategory;
                    }).map((faq, index) => (
                      <div key={faq.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all">
                        <button
                          onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-4 text-left flex-1">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                              {index + 1}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{faq.question}</h3>
                          </div>
                          <ChevronDown
                            className={`w-6 h-6 text-gray-400 transition-transform flex-shrink-0 ml-4 ${expandedId === faq.id ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {expandedId === faq.id && (
                          <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex gap-3">
                              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                              <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpCenter;
