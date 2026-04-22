import React, { useState } from 'react';
import { 
  X,
  ChevronRight,
  Briefcase,
  Users,
  Calendar,
  BarChart2,
  Eye,
  CreditCard,
  ShieldCheck,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  FileText,
  CheckCircle,
  Target,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmployerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmployerSidebar: React.FC<EmployerSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>('hiring');

  const sections = [
    {
      id: 'hiring',
      title: 'Hiring Management',
      icon: <Briefcase size={20} />,
      items: [
        { label: 'Job Postings', icon: <Briefcase size={18} />, path: '/employer/jobs' },
        { label: 'Applicant Tracking', icon: <Users size={18} />, path: '/employer/applicant-tracking' },
        { label: 'Interview Calendar', icon: <Calendar size={18} />, path: '/employer/interview-calendar' },
      ]
    },
    {
      id: 'company',
      title: 'Company',
      icon: <BarChart2 size={20} />,
      items: [
        { label: 'Company Profile', icon: <FileText size={18} />, path: '/employer/profile' },
        { label: 'Analytics', icon: <BarChart2 size={18} />, path: '/employer/analytics' },
        { label: 'Activity Log', icon: <Eye size={18} />, path: '/employer/activity' },
      ]
    },
    {
      id: 'billing',
      title: 'Billing & Plan',
      icon: <CreditCard size={20} />,
      items: [
        { label: 'Subscription Plan', icon: <ShieldCheck size={18} />, path: '/employer/subscription' },
      ]
    },
  ];

  const quickActions = [
    { label: 'Create Job', icon: <Zap size={18} />, path: '/employer/jobs', color: 'bg-blue-50 text-blue-600' },
    { label: 'View Candidates', icon: <Users size={18} />, path: '/employer/applicant-tracking', color: 'bg-purple-50 text-purple-600' },
    { label: 'Schedule Interview', icon: <Calendar size={18} />, path: '/employer/interview-calendar', color: 'bg-green-50 text-green-600' },
  ];

  const stats = [
    { label: 'Active Jobs', value: '12', icon: <Target size={16} />, color: 'text-blue-600' },
    { label: 'Total Applicants', value: '248', icon: <Users size={16} />, color: 'text-purple-600' },
    { label: 'Interviews', value: '18', icon: <Calendar size={16} />, color: 'text-green-600' },
    { label: 'Messages', value: '5', icon: <MessageSquare size={16} />, color: 'text-orange-600' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
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

      {/* Employer Sidebar */}
      <div
        className={`fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Briefcase size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Employer Hub</h2>
              <p className="text-xs text-blue-100">Manage your hiring</p>
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
          <>
            {/* Quick Stats */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
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
                        <div className="ml-6 mt-2 space-y-1 border-l-2 border-slate-200 pl-3">
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

              {/* Inbox Link */}
              <button
                onClick={() => handleNavigation('/employer/inbox')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors text-left border border-orange-200"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} className="text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">Inbox</p>
                    <p className="text-xs text-orange-700">5 new messages</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-orange-600" />
              </button>

              {/* Hiring Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Zap size={18} className="text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 mb-2">Hiring Tip</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Review applications within 24 hours to improve response rates and candidate experience.
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
                      <p className="text-sm font-medium text-slate-900">New Application</p>
                      <p className="text-xs text-slate-600">Senior Developer - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <Calendar size={16} className="text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">Interview Scheduled</p>
                      <p className="text-xs text-slate-600">Product Manager - Tomorrow 2 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <TrendingUp size={16} className="text-purple-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">Job Posted</p>
                      <p className="text-xs text-slate-600">UX Designer - 1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>

            {/* Help & Support */}
            <div className="border-t border-slate-200 pt-4">
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Help & Support</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            </div>
          </>
        </div>
      </div>
    </>
  );
};

export default EmployerSidebar;
