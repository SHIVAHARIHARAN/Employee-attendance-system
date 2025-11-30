import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Auth.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && user) {
      navigate(user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard');
    }
  }, [token, user, navigate]);

  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="landing-header">
          <h1>Employee Attendance System</h1>
          <p>Track and manage attendance efficiently</p>
        </div>
        
        <div className="role-selection">
          <div className="role-card">
            <div className="role-icon employee-icon">👤</div>
            <h2>Employee</h2>
            <p>Track your attendance, view history, and manage your profile</p>
            <div className="role-actions">
              <Link to="/employee/login" className="role-button primary">
                Login
              </Link>
              <Link to="/employee/register" className="role-button secondary">
                Register
              </Link>
            </div>
          </div>

          <div className="role-card">
            <div className="role-icon manager-icon">👔</div>
            <h2>Manager</h2>
            <p>View team attendance, generate reports, and manage employees</p>
            <div className="role-actions">
              <Link to="/manager/login" className="role-button primary">
                Login
              </Link>
              <Link to="/manager/register" className="role-button secondary">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

