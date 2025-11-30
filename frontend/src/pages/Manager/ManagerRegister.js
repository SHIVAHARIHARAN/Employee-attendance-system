import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register, clearError } from '../../store/slices/authSlice';
import '../Auth.css';

const ManagerRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user, loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    department: '',
    role: 'manager',
  });

  useEffect(() => {
    if (token && user) {
      if (user.role === 'manager') {
        navigate('/manager/dashboard');
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
    const result = await dispatch(register(formData));
    if (result.type === 'auth/register/fulfilled') {
      const user = result.payload.user;
      if (user.role === 'manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-main-heading">
        <h1>Employee Attendance System</h1>
        <p>Manager Portal - Create your manager account</p>
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="role-badge manager-badge">👔 Manager</div>
          <h2>Create Account</h2>
          <p>Register as a manager</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>
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
            <label>Manager ID</label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              required
              placeholder="e.g., MGR001"
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              placeholder="Enter your department"
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
              minLength={6}
              placeholder="Minimum 6 characters"
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Register as Manager'}
          </button>
        </form>
        <div className="auth-footer">
          <p>
            Already have an account? <a href="/manager/login">Login as Manager</a>
          </p>
          <p className="switch-role">
            Are you an employee? <a href="/employee/register">Employee Registration</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManagerRegister;

