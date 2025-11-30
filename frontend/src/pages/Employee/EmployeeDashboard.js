import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axios';
import '../Dashboard.css';

const EmployeeDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get('/dashboard/employee');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await axiosInstance.post('/attendance/checkin');
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error checking in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await axiosInstance.post('/attendance/checkout');
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error checking out');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const { todayStatus, todayAttendance, monthStats, recentAttendance } = dashboardData || {};

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Employee Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Today's Status</h3>
            <p className="stat-value">{todayStatus}</p>
            {todayAttendance?.checkInTime && (
              <p className="stat-detail">
                Checked in: {new Date(todayAttendance.checkInTime).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Present Days</h3>
            <p className="stat-value">{monthStats?.present || 0}</p>
            <p className="stat-detail">This month</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>Late Days</h3>
            <p className="stat-value">{monthStats?.late || 0}</p>
            <p className="stat-detail">This month</p>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>Absent Days</h3>
            <p className="stat-value">{monthStats?.absent || 0}</p>
            <p className="stat-detail">This month</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>Total Hours</h3>
            <p className="stat-value">{monthStats?.totalHours || 0}</p>
            <p className="stat-detail">This month</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <div className="action-card">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            {todayAttendance?.checkInTime && !todayAttendance?.checkOutTime ? (
              <button className="btn btn-outline" onClick={handleCheckOut}>
                Check Out
              </button>
            ) : !todayAttendance?.checkInTime ? (
              <button className="btn btn-primary" onClick={handleCheckIn}>
                Check In
              </button>
            ) : (
              <button className="btn btn-disabled" disabled>
                Already Checked Out
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="recent-attendance">
        <h2>Recent Attendance (Last 7 Days)</h2>
        <div className="attendance-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance && recentAttendance.length > 0 ? (
                recentAttendance.map((att) => (
                  <tr key={att._id}>
                    <td>{new Date(att.date).toLocaleDateString()}</td>
                    <td>
                      {att.checkInTime
                        ? new Date(att.checkInTime).toLocaleTimeString()
                        : '-'}
                    </td>
                    <td>
                      {att.checkOutTime
                        ? new Date(att.checkOutTime).toLocaleTimeString()
                        : '-'}
                    </td>
                    <td>
                      <span className={`status-badge status-${att.status}`}>
                        {att.status}
                      </span>
                    </td>
                    <td>{att.totalHours || 0} hrs</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

