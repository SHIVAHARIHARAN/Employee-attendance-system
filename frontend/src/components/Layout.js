import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import './Layout.css';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/', { replace: true });
  };

  const isManager = user?.role === 'manager';
  const basePath = isManager ? '/manager' : '/employee';

  const employeeMenuItems = [
    { path: '/employee/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/employee/attendance', label: 'Mark Attendance', icon: '✅' },
    { path: '/employee/history', label: 'My History', icon: '📅' },
    { path: '/employee/profile', label: 'Profile', icon: '👤' },
  ];

  const managerMenuItems = [
    { path: '/manager/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/manager/attendance', label: 'All Attendance', icon: '👥' },
    { path: '/manager/calendar', label: 'Team Calendar', icon: '📅' },
    { path: '/manager/reports', label: 'Reports', icon: '📈' },
  ];

  const menuItems = isManager ? managerMenuItems : employeeMenuItems;

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1 className="navbar-title">Attendance System</h1>
          </div>
          <div className="navbar-right">
            <span className="user-info">
              {user?.name} ({user?.employeeId})
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="layout-body">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${
                  location.pathname === item.path ? 'active' : ''
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

