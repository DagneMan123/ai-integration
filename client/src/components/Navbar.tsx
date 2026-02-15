import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return `/${user.role}/dashboard`;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h2 className="text-2xl font-bold text-primary">SimuAI</h2>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/jobs" 
              className="text-gray-700 hover:text-primary transition-colors font-medium"
            >
              Browse Jobs
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-primary transition-colors font-medium"
            >
              About Dashboards
            </Link>
            
            {user ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  to={`/${user.role}/profile`} 
                  className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  <FiUser /> Profile
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 text-gray-700 hover:text-danger transition-colors font-medium"
                >
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-700 hover:text-primary"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t">
            <Link 
              to="/jobs" 
              className="block text-gray-700 hover:text-primary transition-colors font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Browse Jobs
            </Link>
            <Link 
              to="/about" 
              className="block text-gray-700 hover:text-primary transition-colors font-medium"
              onClick={() => setMenuOpen(false)}
            >
              About Dashboards
            </Link>
            
            {user ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="block text-gray-700 hover:text-primary transition-colors font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to={`/${user.role}/profile`} 
                  className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  <FiUser /> Profile
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 text-gray-700 hover:text-danger transition-colors font-medium w-full text-left"
                >
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block text-gray-700 hover:text-primary transition-colors font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
