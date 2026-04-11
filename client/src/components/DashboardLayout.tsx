import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSidebar } from '../context/SidebarContext';
import { useSessionMonitoring } from '../hooks/useSessionMonitoring';
import AccountMenu from './AccountMenu';
import { 
  LayoutDashboard, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  Search,
  Settings,
  Activity,
  MessageSquare,
  HelpCircle
} from 'lucide-react';

interface MenuItem {
  path?: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  submenu?: MenuItem[];
  isSection?: boolean;
  description?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  role: 'candidate' | 'employer' | 'admin';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, menuItems, role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [communicationPanelOpen, setCommunicationPanelOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    setSessionMonitoringOpen,
    setGlobalSettingsOpen,
    setSupportTicketsOpen,
    setSettingsOpen,
    setHelpCenterOpen,
    setAdminSidebarOpen,
    setCandidateSidebarOpen,
    setEmployerSidebarOpen,
  } = useSidebar();
  useSessionMonitoring();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const toggleSection = (label: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#0f172a] text-slate-300 transition-all duration-300 ease-in-out flex flex-col shadow-2xl z-30`}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <LayoutDashboard size={18} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">SimuAI</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* User Profile Mini-Card */}
        <div className="p-4">
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
              {user?.firstName?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto">
          {menuItems.map((item) => {
            // Handle section items with submenu
            if (item.isSection && item.submenu) {
              const isExpanded = expandedSections.has(item.label);
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleSection(item.label)}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group hover:bg-slate-800 hover:text-slate-100"
                  >
                    <span className="flex-shrink-0 text-slate-400 group-hover:text-slate-200 transition-colors">
                      {item.icon}
                    </span>
                    {sidebarOpen && (
                      <div className="flex-1 flex items-center justify-between ml-3 min-w-0">
                        <span className="text-sm font-medium truncate">{item.label}</span>
                        <ChevronRight 
                          size={16} 
                          className={`transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </div>
                    )}
                  </button>
                  
                  {/* Submenu items */}
                  {isExpanded && sidebarOpen && (
                    <div className="ml-2 space-y-1 border-l border-slate-700 pl-2 mt-1">
                      {item.submenu.map((subitem) => {
                        const active = subitem.path ? isActive(subitem.path) : false;
                        return (
                          <Link
                            key={subitem.path || subitem.label}
                            to={subitem.path || '#'}
                            onClick={(e) => {
                              if (!subitem.path) {
                                e.preventDefault();
                                if (subitem.label === 'Logout') {
                                  handleLogout();
                                }
                              }
                            }}
                            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group text-sm whitespace-nowrap ${
                              active 
                                ? 'bg-indigo-600/10 text-white' 
                                : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
                            }`}
                          >
                            <span className={`flex-shrink-0 ${active ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-200'} transition-colors`}>
                              {subitem.icon}
                            </span>
                            <div className="ml-2 flex-1 min-w-0">
                              <span className="block text-sm font-medium truncate">{subitem.label}</span>
                              {subitem.description && sidebarOpen && (
                                <span className="text-[11px] text-slate-500 truncate">{subitem.description}</span>
                              )}
                            </div>
                            {subitem.badge ? (
                              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-[#0f172a] flex-shrink-0 ml-auto">
                                {subitem.badge}
                              </span>
                            ) : null}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
            // Handle regular menu items
            const active = item.path ? isActive(item.path) : false;
            return (
              <Link
                key={item.path || item.label}
                to={item.path || '#'}
                onClick={(e) => {
                  if (!item.path) {
                    e.preventDefault();
                    if (item.label === 'Logout') {
                      handleLogout();
                    }
                  }
                }}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative whitespace-nowrap ${
                  active 
                    ? 'bg-indigo-600/10 text-white' 
                    : 'hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <span className={`flex-shrink-0 ${active ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-200'} transition-colors`}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <div className="flex-1 flex flex-col justify-between ml-3 min-w-0">
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    {item.description && (
                      <span className="text-[11px] text-slate-500 truncate">{item.description}</span>
                    )}
                  </div>
                )}
                {/* Tooltip for collapsed mode */}
                {!sidebarOpen && (
                    <div className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700">
                        {item.label}
                    </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-200 group"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3 text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 shrink-0">
          <div className="flex flex-col min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-900 leading-tight truncate">
              {role.charAt(0).toUpperCase() + role.slice(1)} Portal
            </h2>
            <p className="text-xs text-slate-500 font-medium truncate">Professional Recruitment Workspace</p>
          </div>

          {/* Right side controls - flex-shrink-0 prevents overlap */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            {/* Search Bar - Hidden on mobile, takes fixed width */}
            <div className="hidden lg:flex items-center bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 flex-shrink-0">
                <Search size={16} className="text-slate-400 flex-shrink-0" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-transparent border-none text-sm focus:outline-none ml-2 w-40 text-slate-600 placeholder-slate-400"
                />
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0 hover:text-slate-600">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Admin Buttons - Only show for admin role */}
            {role === 'admin' && (
              <>
                <button
                  onClick={() => setAdminSidebarOpen(true)}
                  className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors flex-shrink-0 hover:text-indigo-700"
                  title="Admin Hub"
                >
                  <LayoutDashboard size={20} />
                </button>
                <button
                  onClick={() => setSessionMonitoringOpen(true)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0 hover:text-blue-700"
                  title="Session Monitoring"
                >
                  <Activity size={20} />
                </button>
                <button
                  onClick={() => setGlobalSettingsOpen(true)}
                  className="p-2 text-purple-500 hover:bg-purple-50 rounded-full transition-colors flex-shrink-0 hover:text-purple-700"
                  title="Global Settings"
                >
                  <Settings size={20} />
                </button>
                <button
                  onClick={() => setSupportTicketsOpen(true)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0 hover:text-red-700"
                  title="Support Tickets"
                >
                  <MessageSquare size={20} />
                </button>
              </>
            )}

            {/* Employer Button - Only show for employer role */}
            {role === 'employer' && (
              <button
                onClick={() => setEmployerSidebarOpen(true)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0 hover:text-blue-700"
                title="Employer Hub"
              >
                <LayoutDashboard size={20} />
              </button>
            )}

            {/* Candidate Button - Only show for candidate role */}
            {role === 'candidate' && (
              <button
                onClick={() => setCandidateSidebarOpen(true)}
                className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors flex-shrink-0 hover:text-indigo-700"
                title="Candidate Hub"
              >
                <LayoutDashboard size={20} />
              </button>
            )}

            {/* Settings Button - For non-admin users */}
            {role !== 'admin' && (
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0 hover:text-slate-600"
                title="Settings"
              >
                <Settings size={20} />
              </button>
            )}

            {/* Help Center Button - For all users */}
            <button
              onClick={() => setHelpCenterOpen(true)}
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0 hover:text-slate-600"
              title="Help Center"
            >
              <HelpCircle size={20} />
            </button>
            
            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 flex-shrink-0"></div>
            
            {/* User Profile Section */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <AccountMenu 
                userName={user?.firstName || 'User'} 
                userRole={role}
              />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;