import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axiosInstance from '../../utils/axios';
import './History.css';

const MyAttendanceHistory = () => {
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  const fetchAttendance = async () => {
    try {
      const response = await axiosInstance.get(
        `/attendance/my-history?month=${month}&year=${year}`
      );
      setAttendance(response.data.attendance);
      setSelectedDateDetails(null);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    const details = attendance.find((att) => {
      const attDate = new Date(att.date).toISOString().split('T')[0];
      return attDate === dateStr;
    });
    setSelectedDateDetails(details || null);
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const att = attendance.find((a) => {
        const attDate = new Date(a.date).toISOString().split('T')[0];
        return attDate === dateStr;
      });
      if (att) {
        return `calendar-tile-${att.status}`;
      }
    }
    return null;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="history-page">
      <div className="page-header">
        <h1>My Attendance History</h1>
        <p>View your attendance calendar and details</p>
      </div>

      <div className="history-content">
        <div className="calendar-section">
          <div className="filter-controls">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="filter-select"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="filter-select"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
                (y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                )
              )}
            </select>
          </div>

          <Calendar
            onChange={handleDateClick}
            value={selectedDate}
            tileClassName={tileClassName}
            className="attendance-calendar"
          />

          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-color present"></span>
              <span>Present</span>
            </div>
            <div className="legend-item">
              <span className="legend-color late"></span>
              <span>Late</span>
            </div>
            <div className="legend-item">
              <span className="legend-color half-day"></span>
              <span>Half Day</span>
            </div>
            <div className="legend-item">
              <span className="legend-color absent"></span>
              <span>Absent</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h2>Date Details</h2>
          {selectedDateDetails ? (
            <div className="details-card">
              <div className="detail-item">
                <span className="detail-label">Date:</span>
                <span className="detail-value">
                  {new Date(selectedDateDetails.date).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Check In:</span>
                <span className="detail-value">
                  {selectedDateDetails.checkInTime
                    ? new Date(selectedDateDetails.checkInTime).toLocaleTimeString()
                    : 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Check Out:</span>
                <span className="detail-value">
                  {selectedDateDetails.checkOutTime
                    ? new Date(selectedDateDetails.checkOutTime).toLocaleTimeString()
                    : 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`status-badge status-${selectedDateDetails.status}`}>
                  {selectedDateDetails.status}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Hours:</span>
                <span className="detail-value">
                  {selectedDateDetails.totalHours || 0} hrs
                </span>
              </div>
            </div>
          ) : (
            <div className="no-details">
              <p>Click on a date to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAttendanceHistory;


