import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
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

  const isActive = (path: string) => location.pathname.startsWith(path);

  const getRoleColor = () => {
    switch (role) {
      case 'admin':
        return 'from-red-600 to-red-700';
      case 'employer':
        return 'from-blue-600 to-blue-700';
      case 'candidate':
        return 'from-green-600 to-green-700';
      default:
        return 'from-indigo-600 to-indigo-700';
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return '⚙️';
      case 'employer':
        return '🏢';
      case 'candidate':
        return '👤';
      default:
        return '📊';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b ${getRoleColor()} text-white transition-all duration-300 flex flex-col shadow-xl`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white border-opacity-20">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-lg">
                  🚀
                </div>
                <h1 className="text-xl font-bold">SimuAI</h1>
              </Link>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition"
              title={sidebarOpen ? 'Collapse' : 'Expand'}
            >
              {sidebarOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white border-opacity-20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-lg">
              {user?.firstName?.charAt(0).toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-white text-opacity-70 capitalize flex items-center gap-1">
                  <span>{getRoleIcon()}</span>
                  {role}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-white bg-opacity-20 border-l-4 border-white'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <div className="flex-1 flex items-center justify-between ml-3">
                  <span className="font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white border-opacity-20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            title="Logout"
          >
            <span className="text-xl flex-shrink-0">🚪</span>
            {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {role} Dashboard
              </h2>
              <p className="text-sm text-gray-600 mt-1">Welcome to your professional workspace</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-600">Last login: Just now</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.firstName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
