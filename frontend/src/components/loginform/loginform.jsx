import React, { useState } from 'react';
import './loginform.css';
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useNavigate, Link } from 'react-router-dom';

const Loginform = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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
        <div className="form-box login">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>

            <div className="input-type">
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: '' }); }}
              />
              <FaEnvelope className="icon" />
            </div>
            {errors.email && <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '-20px', marginBottom: '10px' }}>{errors.email}</p>}

            <div className="input-type">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
              />
              <FaLock className="icon" />
            </div>
            {errors.password && <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '-20px', marginBottom: '10px' }}>{errors.password}</p>}

            <div className="remember-forgot">
              <div className="remember-me">
                <input type="checkbox" /> Remember me
              </div>
              <a href="/forgot-password">Forgot Password?</a>
            </div>

            {errors.server && <p style={{ color: '#ff6b6b', fontSize: '13px', textAlign: 'center', marginBottom: '10px' }}>{errors.server}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '14px', color: '#fff' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Loginform;
