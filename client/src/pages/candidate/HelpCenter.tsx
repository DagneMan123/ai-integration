import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, Mail, MessageSquare } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqs: FAQItem[] = [
    {
      id: '1',
      category: 'interviews',
      question: 'How do I prepare for an AI interview?',
      answer: 'AI interviews assess your technical skills, communication, and problem-solving abilities. Practice speaking clearly, maintain eye contact with the camera, and answer questions thoroughly. Review common interview questions and prepare examples from your experience.'
    },
    {
      id: '2',
      category: 'interviews',
      question: 'What should I do if my camera or microphone fails?',
      answer: 'Test your equipment before the interview starts. If issues occur during the interview, try restarting your browser or device. If problems persist, contact support immediately with your interview ID.'
    },
    {
      id: '3',
      category: 'applications',
      question: 'How do I apply for a job?',
      answer: 'Browse available jobs, click on a position that interests you, review the details, and click "Apply". You can add a cover letter to strengthen your application.'
    },
    {
      id: '4',
      category: 'applications',
      question: 'Can I withdraw my application?',
      answer: 'Yes, you can withdraw your application from the Applications page. Click on the application and select "Withdraw". This action cannot be undone.'
    },
    {
      id: '5',
      category: 'profile',
      question: 'How do I update my profile?',
      answer: 'Go to Profile Settings and update your information. You can add a profile picture, update your skills, experience, and education. Changes are saved automatically.'
    },
    {
      id: '6',
      category: 'profile',
      question: 'How do I add my resume?',
      answer: 'In your profile, there is a Resume section where you can upload your PDF or Word document. Make sure your resume is up-to-date and clearly formatted.'
    },
    {
      id: '7',
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards and digital payment methods through our secure payment gateway. All transactions are encrypted and secure.'
    },
    {
      id: '8',
      category: 'billing',
      question: 'Can I get a refund?',
      answer: 'Refund policies vary by service. Contact our support team with your transaction ID for refund inquiries.'
    }
  ];

  const categories = ['all', 'interviews', 'applications', 'profile', 'billing'];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="space-y-6">
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
            {filteredFAQs.length === 0 ? (
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
