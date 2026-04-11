import React, { useState, Suspense } from 'react';
import {
  X,
  ChevronRight,
  Users,
  Building2,
  Briefcase,
  CreditCard,
  BarChart2,
  FileText,
  Settings,
  Shield,
  Bell,
  Activity,
  Eye,
  MessageSquare,
  Zap,
  ChevronLeft,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>('management');
  const [currentView, setCurrentView] = useState<string | null>(null);

  const sections = [
    {
      id: 'management',
      title: 'Platform Management',
      icon: <Users size={20} />,
      items: [
        { label: 'Users', icon: <Users size={18} />, path: '/admin/users' },
        { label: 'Companies', icon: <Building2 size={18} />, path: '/admin/companies' },
        { label: 'Jobs', icon: <Briefcase size={18} />, path: '/admin/jobs' },
      ]
    },
    {
      id: 'financial',
      title: 'Financial',
      icon: <CreditCard size={20} />,
      items: [
        { label: 'Payments', icon: <CreditCard size={18} />, path: '/admin/payments' },
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Monitoring',
      icon: <BarChart2 size={20} />,
      items: [
        { label: 'Analytics', icon: <BarChart2 size={18} />, path: '/admin/analytics' },
        { label: 'Logs', icon: <FileText size={18} />, path: '/admin/logs' },
        { label: 'Activity', icon: <Activity size={18} />, path: '/admin/activity' },
      ]
    },
    {
      id: 'security',
      title: 'Security & Support',
      icon: <Shield size={20} />,
      items: [
        { label: 'Security', icon: <Shield size={18} />, path: '/admin/security' },
        { label: 'Session Monitoring', icon: <Eye size={18} />, path: '/admin/session-monitoring' },
        { label: 'Support Tickets', icon: <MessageSquare size={18} />, path: '/admin/support-tickets' },
      ]
    },
    {
      id: 'settings',
      title: 'Configuration',
      icon: <Settings size={20} />,
      items: [
        { label: 'Settings', icon: <Settings size={18} />, path: '/admin/settings' },
        { label: 'Notifications', icon: <Bell size={18} />, path: '/admin/notifications' },
      ]
    },
  ];

  const quickActions = [
    { label: 'View Users', icon: <Users size={18} />, path: '/admin/users', color: 'bg-blue-50 text-blue-600' },
    { label: 'View Payments', icon: <CreditCard size={18} />, path: '/admin/payments', color: 'bg-green-50 text-green-600' },
    { label: 'View Analytics', icon: <BarChart2 size={18} />, path: '/admin/analytics', color: 'bg-purple-50 text-purple-600' },
  ];

  const stats = [
    { label: 'Total Users', value: '1,234', icon: <Users size={16} />, color: 'text-blue-600' },
    { label: 'Active Companies', value: '89', icon: <Building2 size={16} />, color: 'text-green-600' },
    { label: 'Total Jobs', value: '456', icon: <Briefcase size={16} />, color: 'text-purple-600' },
    { label: 'Revenue', value: '$12.5K', icon: <CreditCard size={16} />, color: 'text-orange-600' },
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

      {/* Admin Sidebar */}
      <div
        className={`fixed right-0 top-0 h-screen bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${currentView ? 'w-full md:w-[90%] lg:w-[75%]' : 'w-96'}`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Admin Panel</h2>
              <p className="text-xs text-slate-300">Platform management</p>
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
                className="flex items-center gap-2 text-slate-600 hover:text-slate-700 mb-4 font-medium"
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

              {/* Admin Tips */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                <div className="flex items-start gap-3">
                  <Zap size={18} className="text-slate-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-2">Admin Tip</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Monitor user activity regularly and review security logs to maintain platform integrity.
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
                      <p className="text-sm font-medium text-slate-900">New User Registration</p>
                      <p className="text-xs text-slate-600">5 new users - 1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <CreditCard size={16} className="text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">Payment Processed</p>
                      <p className="text-xs text-slate-600">$2,500 - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <TrendingUp size={16} className="text-purple-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">System Health</p>
                      <p className="text-xs text-slate-600">All systems operational</p>
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
          )}
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
