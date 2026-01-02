import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createContext, useContext, useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { NotificationContainer } from './components/Notification';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home/Home';
import Simulate from './pages/simulate/Simulate';
import Compare from './pages/compare/Compare';
import History from './pages/history/History';
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import VerifyEmail from './pages/auth/VerifyEmail';

const NotificationContext = createContext(null);
const ThemeContext = createContext(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      showNotification: () => {},
      showError: () => {},
      showSuccess: () => {},
      showWarning: () => {},
      showInfo: () => {}
    };
  }
  return context;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark',
      toggleTheme: () => {}
    };
  }
  return context;
};

function App() {
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState(() => {
    // Default to dark mode if no theme is saved
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      // Set dark mode as default and save it
      localStorage.setItem('theme', 'dark');
      return 'dark';
    }
    return savedTheme;
  });

  useEffect(() => {
    // Apply theme class to document root immediately
    document.documentElement.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply dark mode on initial mount if no theme is saved
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      document.documentElement.className = 'theme-dark';
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'bright' : 'dark'));
  };

  const showNotification = (message, type = 'error', duration = 5000) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const notificationValue = {
    showNotification,
    showError: (message, duration) => showNotification(message, 'error', duration),
    showSuccess: (message, duration) => showNotification(message, 'success', duration),
    showWarning: (message, duration) => showNotification(message, 'warning', duration),
    showInfo: (message, duration) => showNotification(message, 'info', duration),
    clearAllNotifications: () => setNotifications([])
  };

  const themeValue = {
    theme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      <NotificationContext.Provider value={notificationValue}>
        <BrowserRouter>
          <div className="App w-full min-h-screen">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/simulate" element={<Simulate />} />
              <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
            </Routes>
            <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
          </div>
        </BrowserRouter>
      </NotificationContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;
