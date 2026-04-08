import React, { useState } from 'react';
import { X, HelpCircle, BookOpen, Zap, AlertCircle, ChevronRight, Mail, MessageSquare, Send, Loader } from 'lucide-react';
import { useHelpCenter } from '../hooks/useHelpCenter';

interface HelpCenterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpCenterSidebar: React.FC<HelpCenterSidebarProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'getting-started' | 'interview-tips' | 'troubleshooting' | 'contact'>('home');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const { articles, loading, submitTicket } = useHelpCenter();

  const handleSubmitTicket = async () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSubmittingTicket(true);
      await submitTicket(ticketSubject, ticketMessage, 'general');
      setTicketSuccess(true);
      setTicketSubject('');
      setTicketMessage('');

      setTimeout(() => setTicketSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Failed to submit ticket. Please try again.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const tabs = [
    { id: 'home', label: 'Help', icon: <HelpCircle size={18} /> },
    { id: 'getting-started', label: 'Getting Started', icon: <BookOpen size={18} /> },
    { id: 'interview-tips', label: 'Tips', icon: <Zap size={18} /> },
    { id: 'troubleshooting', label: 'Issues', icon: <AlertCircle size={18} /> },
    { id: 'contact', label: 'Contact', icon: <Mail size={18} /> },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-screen w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Help Center</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 sticky top-20">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1 px-3 py-2 font-medium text-xs whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Home Tab */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Welcome to Help Center</h3>
                <p className="text-sm text-gray-600">Find answers and get support</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('getting-started')}
                  className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">Getting Started</h4>
                      <p className="text-xs text-gray-600">6-step setup guide</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('interview-tips')}
                  className="w-full p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">Interview Tips</h4>
                      <p className="text-xs text-gray-600">Prepare for success</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-emerald-600" />
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('troubleshooting')}
                  className="w-full p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">Troubleshooting</h4>
                      <p className="text-xs text-gray-600">Solve common issues</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-purple-600" />
                  </div>
                </button>
              </div>

              {/* Recent Articles from Database */}
              {!loading && articles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900 text-sm">Popular Articles</h4>
                  {articles.slice(0, 3).map((article) => (
                    <div key={article.id} className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                      <p className="text-xs font-medium text-gray-900 truncate">{article.title}</p>
                      <p className="text-xs text-gray-500">{article.views} views</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Getting Started Tab */}
          {activeTab === 'getting-started' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">Getting Started</h3>
              {[
                { num: 1, title: 'Create Account', desc: 'Sign up and verify email' },
                { num: 2, title: 'Complete Profile', desc: 'Add your professional info' },
                { num: 3, title: 'Browse Jobs', desc: 'Search and apply for positions' },
                { num: 4, title: 'Prepare Interview', desc: 'Use practice mode' },
                { num: 5, title: 'Attend Interview', desc: 'Join your scheduled session' },
                { num: 6, title: 'Review Results', desc: 'Get AI feedback' },
              ].map((step) => (
                <div key={step.num} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{step.title}</h4>
                      <p className="text-xs text-gray-600">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Interview Tips Tab */}
          {activeTab === 'interview-tips' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">Interview Tips</h3>
              {[
                { title: 'Before', items: ['Test connection', 'Check camera', 'Find quiet room', 'Wear professional'] },
                { title: 'During', items: ['Eye contact', 'Speak clearly', 'Listen carefully', 'Use examples'] },
              ].map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="font-bold text-gray-900 text-sm">{section.title} Interview</h4>
                  <ul className="space-y-1">
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2 text-xs text-gray-700">
                        <span className="text-blue-600 font-bold">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Troubleshooting Tab */}
          {activeTab === 'troubleshooting' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">Troubleshooting</h3>
              {[
                { title: 'Camera Issues', solutions: ['Check connection', 'Verify permissions', 'Refresh page'] },
                { title: 'Microphone Issues', solutions: ['Check connection', 'Verify permissions', 'Test volume'] },
                { title: 'Internet Issues', solutions: ['Check speed', 'Move closer to router', 'Close other apps'] },
              ].map((issue, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="font-bold text-gray-900 text-sm">{issue.title}</h4>
                  <ul className="space-y-1">
                    {issue.solutions.map((solution, solIdx) => (
                      <li key={solIdx} className="flex items-start gap-2 text-xs text-gray-700">
                        <span className="text-emerald-600 font-bold">✓</span>
                        {solution}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">Contact Support</h3>
              
              {ticketSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700 font-bold">✓ Ticket submitted successfully!</p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">Subject</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Describe your issue"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">Message</label>
                  <textarea
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Tell us more..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmitTicket}
                  disabled={submittingTicket}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-bold text-sm transition-all"
                >
                  {submittingTicket ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Ticket
                    </>
                  )}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <h4 className="font-bold text-gray-900">Other Ways to Reach Us</h4>
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm font-bold">
                  <Mail className="w-4 h-4" />
                  Email Support
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm font-bold">
                  <MessageSquare className="w-4 h-4" />
                  Live Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HelpCenterSidebar;
