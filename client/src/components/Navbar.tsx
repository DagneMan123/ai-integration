import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  ChevronDown,
  Briefcase,
  Info,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Hide navbar on dashboard pages
  const isDashboardPage = location.pathname.includes('/candidate/') || 
                          location.pathname.includes('/employer/') || 
                          location.pathname.includes('/admin/');

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    if (isDashboardPage) return;
    
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDashboardPage]);

  if (isDashboardPage) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const getDashboardLink = () => (user ? `/${user.role}/dashboard` : '/');

  const navLinks = [
    { label: 'Browse Jobs', path: '/jobs', icon: <Briefcase size={18} /> },
    { label: 'Platform Info', path: '/about', icon: <Info size={18} /> },
  ];

  return (
    <nav className={`sticky top-0 w-full z-[100] transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-slate-100 py-3' 
        : 'bg-white/50 backdrop-blur-md py-5 border-b border-slate-100/50'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
              <Sparkles size={22} className="font-bold" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight hidden sm:inline">
              SimuAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    location.pathname === link.path 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-slate-200"></div>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {user.firstName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 hidden sm:inline">{user.firstName}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Professional Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account</p>
                    </div>
                    <Link 
                      to={getDashboardLink()} 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} className="text-slate-400" /> Dashboard
                    </Link>
                    <Link 
                      to={`/${user.role}/profile`} 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={16} className="text-slate-400" /> My Profile
                    </Link>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors font-semibold"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-slate-50">
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 group"
                >
                  Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Sidebar Navigation */}
        {menuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-lg py-6 px-6 animate-in slide-in-from-top-5">
            <div className="space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`flex items-center gap-3 text-base font-semibold py-2 px-3 rounded-lg transition-all ${
                    location.pathname === link.path
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
              <hr className="border-slate-200 my-2" />
              {user ? (
                <>
                  <Link 
                    to={getDashboardLink()} 
                    className="flex items-center gap-3 text-base font-semibold py-2 px-3 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-base font-semibold py-2 px-3 rounded-lg text-red-600 hover:bg-red-50 w-full text-left transition-all"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-2">
                  <Link 
                    to="/login" 
                    className="text-center py-3 rounded-lg font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-center py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;