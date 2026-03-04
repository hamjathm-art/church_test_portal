import React, { useState } from 'react';
import '../loginform/loginform.css';
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { useNavigate, Link } from 'react-router-dom';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        alert('Registration successful! Please login.');
        navigate('/login');
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
      <div className="wrapper">
        <div className="form-box login">
          <form onSubmit={handleRegister}>
            <h1>Register</h1>

            <div className="input-type">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: '' }); }}
              />
              <FaUser className="icon" />
            </div>
            {errors.name && <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '-20px', marginBottom: '10px' }}>{errors.name}</p>}

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

            {errors.server && <p style={{ color: '#ff6b6b', fontSize: '13px', textAlign: 'center', marginBottom: '10px' }}>{errors.server}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '14px', color: '#fff' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
