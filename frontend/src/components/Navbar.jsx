import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { isAuthenticated, getCurrentUser, logout as authLogout } from '../utils/api/auth';
import { useTheme } from '../App';
import '../index.css';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  useEffect(() => {
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const checkAuthStatus = async () => {
    if (isAuthenticated()) {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const handleLogout = () => {
    authLogout();
    setIsLoggedIn(false);
    setUser(null);
    setShowUserMenu(false);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  return (
    <nav className="navbar sticky top-0 z-50 w-full h-16 bg-emerald-950/40 backdrop-blur-md border-b border-emerald-400/15 shadow-[0_8px_30px_rgba(0,255,120,0.08)]">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
        </div>
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/simulate" className={`nav-link ${location.pathname === '/simulate' ? 'active' : ''}`}>Simulate</Link>
          {isLoggedIn && (
            <>
              <Link to="/history" className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}>History</Link>
              <Link to="/compare" className={`nav-link ${location.pathname === '/compare' ? 'active' : ''}`}>Compare</Link>
            </>
          )}
          <button
            onClick={toggleTheme}
            className="nav-link theme-toggle flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-[rgba(0,255,111,0.1)] transition-colors"
            title={theme === 'dark' ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <>
                <span className="text-lg">☀️</span>
                <span className="hidden sm:inline">Bright</span>
              </>
            ) : (
              <>
                <span className="text-lg">🌙</span>
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
          {!isLoggedIn ? (
            <>
              <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>Log In</Link>
              <Link to="/signup" className="nav-link signup-btn">Sign Up</Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="nav-link flex items-center gap-2"
              >
                <span>{user?.full_name || user?.email?.split('@')[0] || 'User'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 theme-bg-dropdown border theme-border-secondary rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm theme-text-secondary border-b theme-border-primary">
                      <div className="font-semibold theme-text-accent">{user?.full_name || 'User'}</div>
                      <div className="text-xs theme-text-muted">{user?.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm theme-text-secondary hover:bg-[rgba(0,255,111,0.1)] hover:text-[#00FF6F] transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}
