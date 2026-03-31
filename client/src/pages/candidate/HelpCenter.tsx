import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, Mail, MessageSquare, BookOpen, Zap, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const MOCK_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I create an account?',
    answer: 'To create an account, click on the "Register" button on the homepage. Fill in your email, password, and select your role (Candidate, Employer, or Admin). Verify your email and you\'re ready to go!',
    category: 'account'
  },
  {
    id: 'faq-2',
    question: 'How do I apply for a job?',
    answer: 'Browse available jobs on the Jobs page, click on a job posting, and click the "Apply" button. You can track your applications in the Applications section of your dashboard.',
    category: 'jobs'
  },
  {
    id: 'faq-3',
    question: 'What is an AI interview?',
    answer: 'An AI interview is an automated interview conducted by our AI system. It evaluates your responses to predefined questions and provides feedback on your performance.',
    category: 'interviews'
  },
  {
    id: 'faq-4',
    question: 'How do I schedule an interview?',
    answer: 'Once you\'ve applied for a job, the employer may invite you to an interview. You can accept or reschedule the interview from your Interviews page.',
    category: 'interviews'
  },
  {
    id: 'faq-5',
    question: 'How do I update my profile?',
    answer: 'Go to your Profile page, click "Edit Profile", update your information, and click "Save Changes". Make sure to keep your profile up-to-date for better job matches.',
    category: 'account'
  },
  {
    id: 'faq-6',
    question: 'How do I prepare for an AI interview?',
    answer: 'Use our Practice Mode to familiarize yourself with the interview format. Run a System Check before your interview to ensure your camera, microphone, and internet connection are working properly.',
    category: 'interviews'
  },
  {
    id: 'faq-7',
    question: 'What should I do before starting an interview?',
    answer: 'Before starting an interview, ensure you have a stable internet connection, good lighting, and a quiet environment. Run the System Check to verify your camera and microphone are working.',
    category: 'interviews'
  },
  {
    id: 'faq-8',
    question: 'How do I contact support?',
    answer: 'You can reach our support team via email at support@simuai.com or use the live chat feature available on the platform. We typically respond within 24 hours.',
    category: 'support'
  },
  {
    id: 'faq-9',
    question: 'How do I save a job?',
    answer: 'Click the bookmark icon on any job posting to save it. You can view all your saved jobs in the "Saved Jobs" section under the Jobs menu.',
    category: 'jobs'
  },
  {
    id: 'faq-10',
    question: 'Can I reschedule my interview?',
    answer: 'Yes, you can reschedule your interview from the Interviews page. Click on the interview you want to reschedule and select a new time slot.',
    category: 'interviews'
  }
];

const HelpCenter: React.FC = () => {
  const [faqs] = useState<FAQItem[]>(MOCK_FAQS);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(faqs.map(faq => faq.category))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (cat: string) => {
    const labels: { [key: string]: string } = {
      'all': 'All Articles',
      'account': 'Account & Profile',
      'jobs': 'Jobs & Applications',
      'interviews': 'Interviews & Practice',
      'support': 'Support & Contact'
    };
    return labels[cat] || cat;
  };

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
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {getCategoryLabel(category)}
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
              {filteredFAQs.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold text-lg">No articles found</p>
                  <p className="text-gray-400 mt-2">Try a different search term or browse other categories</p>
                </div>
              ) : (
                filteredFAQs.map((faq, index) => (
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpCenter;
