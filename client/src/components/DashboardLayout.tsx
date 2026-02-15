import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-indigo-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-indigo-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold">SimuAI</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded hover:bg-indigo-800"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-indigo-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-indigo-300 capitalize">{role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 hover:bg-indigo-800 transition ${
                isActive(item.path) ? 'bg-indigo-800 border-l-4 border-white' : ''
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-indigo-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 hover:bg-indigo-800 rounded transition"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <h2 className="text-2xl font-semibold text-gray-800 capitalize">
              {role} Dashboard
            </h2>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
