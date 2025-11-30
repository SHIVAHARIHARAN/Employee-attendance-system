import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../../store/slices/authSlice';
import '../Auth.css';

const EmployeeLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user, loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (token && user) {
      if (user.role === 'employee') {
        navigate('/employee/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [token, user, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(formData));
    if (result.type === 'auth/login/fulfilled') {
      const user = result.payload.user;
      if (user.role === 'employee') {
        navigate('/employee/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-main-heading">
        <h1>Employee Attendance System</h1>
        <p>Employee Portal - Sign in to track your attendance</p>
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="role-badge employee-badge">👤 Employee</div>
          <h2>Welcome Back</h2>
          <p>Sign in to your employee account</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In as Employee'}
          </button>
        </form>
        <div className="auth-footer">
          <p>
            Don't have an account? <a href="/employee/register">Register as Employee</a>
          </p>
          <p className="switch-role">
            Are you a manager? <a href="/manager/login">Manager Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;

