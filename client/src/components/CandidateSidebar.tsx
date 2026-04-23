import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  User,
  Settings,
  Shield,
  Bell,
  Activity,
  FileText,
  Briefcase,
  Clock,
  BookOpen,
  MessageSquare,
  Heart,
  AlertCircle,
  Zap,
  ChevronLeft,
  TrendingUp,
  CheckCircle,
  Award,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CandidateSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CandidateSidebar: React.FC<CandidateSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>('applications');
  const [currentView, setCurrentView] = useState<string | null>(null);

  const sections = [
    {
      id: 'applications',
      title: 'Job Applications',
      icon: <Briefcase size={20} />,
      items: [
        { label: 'Applications', icon: <Briefcase size={18} />, path: '/candidate/applications' },
        { label: 'Saved Jobs', icon: <Heart size={18} />, path: '/candidate/saved-jobs' },
        { label: 'Job Alerts', icon: <Bell size={18} />, path: '/candidate/job-alerts' },
      ]
    },
    {
      id: 'interviews',
      title: 'Interviews',
      icon: <Clock size={20} />,
      items: [
        { label: 'Interviews', icon: <Clock size={18} />, path: '/candidate/interviews' },
        { label: 'Interview History', icon: <FileText size={18} />, path: '/candidate/interview-history' },
        { label: 'Interview Insights', icon: <TrendingUp size={18} />, path: '/candidate/interview-insights' },
        { label: 'Interview Tips', icon: <BookOpen size={18} />, path: '/candidate/interview-tips' },
      ]
    },
    {
      id: 'profile',
      title: 'Profile & Account',
      icon: <User size={20} />,
      items: [
        { label: 'Profile', icon: <User size={18} />, path: '/candidate/profile' },
        { label: 'Resume', icon: <FileText size={18} />, path: '/candidate/resume' },
        { label: 'Account Settings', icon: <Settings size={18} />, path: '/candidate/account-settings' },
      ]
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: <Shield size={20} />,
      items: [
        { label: 'Security', icon: <Shield size={18} />, path: '/candidate/security' },
        { label: 'Settings', icon: <Settings size={18} />, path: '/candidate/settings' },
      ]
    },
    {
      id: 'resources',
      title: 'Resources & Support',
      icon: <BookOpen size={20} />,
      items: [
        { label: 'Getting Started', icon: <BookOpen size={18} />, path: '/candidate/getting-started' },
        { label: 'Practice', icon: <Award size={18} />, path: '/candidate/practice' },
        { label: 'System Check', icon: <AlertCircle size={18} />, path: '/candidate/system-check' },
        { label: 'Troubleshooting', icon: <AlertCircle size={18} />, path: '/candidate/troubleshooting' },
        { label: 'Help Center', icon: <MessageSquare size={18} />, path: '/candidate/help-center' },
      ]
    },
    {
      id: 'account',
      title: 'Account & Notifications',
      icon: <Bell size={20} />,
      items: [
        { label: 'Notifications', icon: <Bell size={18} />, path: '/candidate/notifications' },
        { label: 'Activity', icon: <Activity size={18} />, path: '/candidate/activity' },
        { label: 'Messages', icon: <MessageSquare size={18} />, path: '/candidate/messages' },
      ]
    },
  ];

  const quickActions = [
    { label: 'Browse Jobs', icon: <Briefcase size={18} />, path: '/jobs', color: 'bg-blue-50 text-blue-600' },
    { label: 'Enhanced Dashboard', icon: <TrendingUp size={18} />, path: '/candidate/enhanced-dashboard', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'My Applications', icon: <FileText size={18} />, path: '/candidate/applications', color: 'bg-purple-50 text-purple-600' },
  ];

  const stats = [
    { label: 'Applications', value: '12', icon: <Briefcase size={16} />, color: 'text-blue-600' },
    { label: 'Interviews', value: '3', icon: <Clock size={16} />, color: 'text-green-600' },
    { label: 'Saved Jobs', value: '28', icon: <Heart size={16} />, color: 'text-red-600' },
    { label: 'Profile Views', value: '156', icon: <Eye size={16} />, color: 'text-purple-600' },
  ];

  const handleNavigation = (path: string) => {
    // For now, navigate to full page
    navigate(path);
    onClose();
  };

  const handleBackToMenu = () => {
    setCurrentView(null);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Candidate Sidebar */}
      <div
        className={`fixed right-0 top-0 h-screen bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${currentView ? 'w-full md:w-[90%] lg:w-[75%]' : 'w-96'}`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Candidate Hub</h2>
              <p className="text-xs text-indigo-100">Your career journey</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          {currentView ? (
            <>
              {/* Back Button */}
              <button
                onClick={handleBackToMenu}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 font-medium"
              >
                <ChevronLeft size={20} />
                Back to Menu
              </button>

              {/* Inline Content Placeholder */}
              <div className="text-center py-12">
                <AlertCircle size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600">Content view coming soon</p>
              </div>
            </>
          ) : (
            <>
              {/* Quick Stats */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={stat.color}>{stat.icon}</span>
                        <span className="text-xs text-slate-600">{stat.label}</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleNavigation(action.path)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${action.color} hover:opacity-80`}
                    >
                      {action.icon}
                      <span className="text-sm font-medium">{action.label}</span>
                      <ChevronRight size={16} className="ml-auto" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Sections */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Navigation
                </h3>
                <div className="space-y-2">
                  {sections.map((section) => (
                    <div key={section.id}>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">{section.icon}</span>
                          <span className="text-sm font-medium text-slate-700">
                            {section.title}
                          </span>
                        </div>
                        <ChevronRight
                          size={16}
                          className={`text-slate-400 transition-transform ${
                            expandedSection === section.id ? 'rotate-90' : ''
                          }`}
                        />
                      </button>

                      {/* Submenu Items */}
                      {expandedSection === section.id && (
                        <div className="ml-6 mt-2 space-y-1 border-l-2 border-indigo-200 pl-3">
                          {section.items.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleNavigation(item.path)}
                              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 group-hover:text-slate-600">
                                  {item.icon}
                                </span>
                                <span className="text-sm text-slate-600 group-hover:text-slate-900">
                                  {item.label}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Tips */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                <div className="flex items-start gap-3">
                  <Zap size={18} className="text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900 mb-2">Career Tip</h4>
                    <p className="text-xs text-indigo-700 leading-relaxed">
                      Complete your profile and practice interviews to increase your chances of landing your dream job.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">Application Submitted</p>
                      <p className="text-xs text-slate-600">Senior Developer - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <Clock size={16} className="text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">Interview Scheduled</p>
                      <p className="text-xs text-slate-600">Tomorrow 2 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <TrendingUp size={16} className="text-purple-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">Profile Viewed</p>
                      <p className="text-xs text-slate-600">3 companies - 1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help & Support */}
              <div className="border-t border-slate-200 pt-4">
                <button
                  onClick={() => handleNavigation('/help-center')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Help & Support</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CandidateSidebar;
