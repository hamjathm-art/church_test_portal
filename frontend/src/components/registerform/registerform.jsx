import React, { useState, useRef } from 'react';
import '../loginform/loginform.css';
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from 'react-router-dom';
const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null); 
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const result = await response.json();
      if (result.success) {
        showToast('Registration successful! Redirecting to login...', 'success');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setErrors({ server: result.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ server: 'Server error. Make sure backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-form'>
      {toast && (
        <div className={`login-toast login-toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button className="login-toast-close" onClick={() => setToast(null)}>&times;</button>
        </div>
      )}
      <div className="wrapper">
        {/* Header Banner */}
        <div className="login-header">
          <img src="/images/l5.png" alt="Church Logo" className="login-logo" />
          <p className="login-church-name">St. Francis of Assisi Church</p>
        </div>

        <div className="form-box login">
          <form onSubmit={handleRegister}>
            <h1 className="login-title">Create Account</h1>
            <p className="login-subtitle">Register to get started.</p>

            <div className="input-type">
              <FaUser className="icon" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: '' }); }}
              />
              <FaUser className="icon-right" />
            </div>
            {errors.name && <p className="login-error">{errors.name}</p>}

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

            {errors.server && <p className="login-server-error">{errors.server}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>

            <div className="login-register-link">
              Already have an account?{' '}
              <Link to="/login">Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
