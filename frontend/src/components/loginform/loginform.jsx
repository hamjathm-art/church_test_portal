import React, { useState } from 'react';
import './loginform.css';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from 'react-router-dom';
const Loginform = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) { 
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (result.success) {
        localStorage.setItem('userName', result.data.user.name);
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        setErrors({ server: result.message || 'Invalid email or password' });
      }
    } catch (error) {
      setErrors({ server: 'Server error. Make sure backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-form'>
      <div className="wrapper">
        {/* Header Banner */}
        <div className="login-header">
          <img src="/images/l5.png" alt="Church Logo" className="login-logo" />
          <p className="login-church-name">St. Francis of Assisi Church</p>
        </div>

        <div className="form-box login">
          <form onSubmit={handleLogin}>
            <h1 className="login-title">Welcome Back!</h1>
            <p className="login-subtitle">Please sign in to your account.</p>

            <div className="input-type">
              <FaEnvelope className="icon" />
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: '' }); }}
              />
              <FaEnvelope className="icon-right" />
            </div>
            {errors.email && <p className="login-error">{errors.email}</p>}

            <div className="input-type">
              <FaLock className="icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
              />
              <span className="icon-right" onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.password && <p className="login-error">{errors.password}</p>}

            <div className="remember-forgot">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="/forgot-password">Forgot Password?</a>
            </div>

            {errors.server && <p className="login-server-error">{errors.server}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="login-register-link">
              Don't have an account?{' '}
              <Link to="/register">Register</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Loginform;
