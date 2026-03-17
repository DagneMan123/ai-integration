import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, ChevronDown, Mail, MessageSquare } from 'lucide-react';
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
    question: 'How do I post a job?',
    answer: 'As an employer, go to the Jobs section and click "Create New Job". Fill in the job details, requirements, and salary information, then publish.',
    category: 'jobs'
  },
  {
    id: 'faq-7',
    question: 'What payment methods do you accept?',
    answer: 'We accept credit cards, debit cards, and digital payment methods through our secure payment gateway.',
    category: 'payments'
  },
  {
    id: 'faq-8',
    question: 'How do I contact support?',
    answer: 'You can reach our support team via email at support@simuai.com or use the live chat feature available on the platform.',
    category: 'support'
  }
];

const HelpCenter: React.FC = () => {
  const [faqs] = useState<FAQItem[]>(MOCK_FAQS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Mock data is already loaded
    setLoading(false);
  }, []);

  const categories = ['all', ...new Set(faqs.map(faq => faq.category))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex items-center gap-3">
          <HelpCircle className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 space-y-2">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-4 py-2 rounded-lg capitalize transition ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Contact Support */}
            <div className="bg-blue-50 rounded-lg p-4 mt-4 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">Still need help?</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  <Mail size={16} />
                  Email Support
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm">
                  <MessageSquare size={16} />
                  Live Chat
                </button>
              </div>
            </div>
          </div>

          {/* FAQ List */}
          <div className="lg:col-span-3 space-y-3">
            {loading ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <HelpCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>Loading FAQs...</p>
              </div>
            ) : filteredFAQs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <HelpCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>No articles found. Try a different search.</p>
              </div>
            ) : (
              filteredFAQs.map(faq => (
                <div key={faq.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
                  >
                    <h3 className="text-left font-semibold text-gray-900">{faq.question}</h3>
                    <ChevronDown
                      size={20}
                      className={`text-gray-400 transition ${expandedId === faq.id ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedId === faq.id && (
                    <div className="px-4 pb-4 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpCenter;
