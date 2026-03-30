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
  ArrowRight
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-slate-200 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:rotate-6 transition-transform">
              <LayoutDashboard size={20} />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors hover:text-indigo-600 ${
                    location.pathname === link.path ? 'text-indigo-600' : 'text-slate-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user.firstName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{user.firstName}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Professional Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account</p>
                    </div>
                    <Link 
                      to={getDashboardLink()} 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} className="text-slate-400" /> Dashboard
                    </Link>
                    <Link 
                      to={`/${user.role}/profile`} 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={16} className="text-slate-400" /> My Profile
                    </Link>
                    <div className="border-t border-slate-50 mt-1 pt-1">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 w-full text-left transition-colors font-semibold"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-600 shadow-lg shadow-slate-900/10 transition-all flex items-center gap-2 group"
                >
                  Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-50 text-slate-600"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Sidebar Navigation */}
        {menuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl py-6 px-6 animate-in slide-in-from-top-5">
            <div className="space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className="flex items-center gap-3 text-lg font-bold text-slate-800"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
              <hr className="border-slate-100" />
              {user ? (
                <>
                  <Link 
                    to={getDashboardLink()} 
                    className="flex items-center gap-3 text-lg font-bold text-slate-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard /> Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-lg font-bold text-rose-600"
                  >
                    <LogOut /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link 
                    to="/login" 
                    className="text-center py-3 rounded-xl font-bold text-slate-700 bg-slate-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-center py-3 rounded-xl font-bold text-white bg-indigo-600 shadow-lg shadow-indigo-200"
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