import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';
import './Attendance.css';

const MarkAttendance = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await axiosInstance.get('/attendance/today');
      setTodayAttendance(response.data.attendance);
    } catch (error) {
      console.error('Error fetching today status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await axiosInstance.post('/attendance/checkin');
      setMessage('Checked in successfully!');
      setTodayAttendance(response.data.attendance);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error checking in');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await axiosInstance.post('/attendance/checkout');
      setMessage('Checked out successfully!');
      setTodayAttendance(response.data.attendance);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error checking out');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const canCheckIn = !todayAttendance || !todayAttendance.checkInTime;
  const canCheckOut = todayAttendance?.checkInTime && !todayAttendance?.checkOutTime;

  return (
    <div className="attendance-page">
      <div className="page-header">
        <h1>Mark Attendance</h1>
        <p>Check in and check out for today</p>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="attendance-card">
        <div className="attendance-status">
          <h2>Today's Attendance</h2>
          <div className="status-info">
            <div className="info-item">
              <span className="info-label">Date:</span>
              <span className="info-value">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            {todayAttendance?.checkInTime && (
              <div className="info-item">
                <span className="info-label">Check In:</span>
                <span className="info-value">
                  {new Date(todayAttendance.checkInTime).toLocaleTimeString()}
                </span>
              </div>
            )}
            {todayAttendance?.checkOutTime && (
              <div className="info-item">
                <span className="info-label">Check Out:</span>
                <span className="info-value">
                  {new Date(todayAttendance.checkOutTime).toLocaleTimeString()}
                </span>
              </div>
            )}
            {todayAttendance?.status && (
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className={`status-badge status-${todayAttendance.status}`}>
                  {todayAttendance.status}
                </span>
              </div>
            )}
            {todayAttendance?.totalHours > 0 && (
              <div className="info-item">
                <span className="info-label">Total Hours:</span>
                <span className="info-value">{todayAttendance.totalHours} hrs</span>
              </div>
            )}
          </div>
        </div>

        <div className="attendance-actions">
          {canCheckIn && (
            <button className="btn btn-primary btn-large" onClick={handleCheckIn}>
              Check In
            </button>
          )}
          {canCheckOut && (
            <button className="btn btn-outline btn-large" onClick={handleCheckOut}>
              Check Out
            </button>
          )}
          {!canCheckIn && !canCheckOut && (
            <p className="info-text">You have already completed today's attendance.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;


