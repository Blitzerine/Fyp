import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../images/logo.png';
import API_BASE_URL from '../config/api';

function Signup() {
  const navigate = useNavigate();
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateSignup = () => {
    const newErrors = {};
    
    if (!signupData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!signupData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!signupData.password) {
      newErrors.password = 'Password is required';
    } else if (signupData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateSignup()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password
        })
      });
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Signup failed' }));
        throw new Error(errorData.message || 'Signup failed');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Signup failed');
      }
      
      // Handle success - store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        name: data.user.name,
        email: data.user.email,
        id: data.user.id
      }));
      
      navigate('/simulate');
      
    } catch (error) {
      // Handle network errors and API errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setErrors({ submit: 'Cannot connect to server. Please make sure the backend is running on port 5000.' });
      } else {
        setErrors({ submit: error.message || 'An error occurred during signup' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="auth-page">
      <div className="auth-modal-overlay">
        <div className="auth-modal">
          <button className="close-btn" onClick={handleClose}>×</button>
          <div className="auth-container">
            <div className="auth-left">
              <div className="auth-gradient-circle"></div>
              <img src={logo} alt="Logo" className="auth-logo" />
            </div>
            <div className="auth-right">
              <h2 className="auth-title">Create Account</h2>
              <form className="auth-form" onSubmit={handleSignup}>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Name" 
                    className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                    value={signupData.name}
                    onChange={handleSignupChange}
                    disabled={loading}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Email" 
                    className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                    value={signupData.email}
                    onChange={handleSignupChange}
                    disabled={loading}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <input 
                    type="password" 
                    name="password"
                    placeholder="Password" 
                    className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                    value={signupData.password}
                    onChange={handleSignupChange}
                    disabled={loading}
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>
                {errors.submit && <div className="error-message error-message-submit">{errors.submit}</div>}
                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>
              <div className="auth-divider"></div>
              <p className="auth-switch">
                Already have an account?{' '}
                <Link to="/login" className="auth-link">Login now</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;

