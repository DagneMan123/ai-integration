import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiUser, FiLogOut, FiMenu } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return `/${user.role}/dashboard`;
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <h2>SimuAI</h2>
        </Link>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <FiMenu />
        </button>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/jobs" className="navbar-link">Browse Jobs</Link>
          
          {user ? (
            <>
              <Link to={getDashboardLink()} className="navbar-link">Dashboard</Link>
              <Link to={`/${user.role}/profile`} className="navbar-link">
                <FiUser /> Profile
              </Link>
              <button onClick={handleLogout} className="navbar-link btn-logout">
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
