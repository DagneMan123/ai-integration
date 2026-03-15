import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  Search,
  CircleUser
} from 'lucide-react';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode; // Changed to ReactNode for professional icons
  badge?: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  role: 'candidate' | 'employer' | 'admin';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, menuItems, role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

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
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
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
                  <div className="flex-1 flex items-center justify-between ml-3 min-w-0">
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-[#0f172a] flex-shrink-0 ml-2">
                        {item.badge}
                      </span>
                    ) : null}
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
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 gap-4">
          <div className="flex flex-col min-w-0">
            <h2 className="text-lg font-bold text-slate-900 leading-tight truncate">
              {role.charAt(0).toUpperCase() + role.slice(1)} Portal
            </h2>
            <p className="text-xs text-slate-500 font-medium truncate">Professional Recruitment Workspace</p>
          </div>

          <div className="flex items-center gap-2 md:gap-6 flex-shrink-0">
            {/* Search Bar - Hidden on mobile */}
            <div className="hidden lg:flex items-center bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 flex-shrink-0">
                <Search size={16} className="text-slate-400 flex-shrink-0" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-transparent border-none text-sm focus:outline-none ml-2 w-40 text-slate-600 placeholder-slate-400"
                />
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            
            {/* User Profile Section */}
            <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-6 border-l border-slate-200 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.firstName}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Verified Account</p>
              </div>
              <div className="cursor-pointer hover:ring-4 hover:ring-indigo-50 transition-all rounded-full">
                <CircleUser size={32} className="text-slate-300" />
              </div>
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