import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axiosInstance from '../../utils/axios';
import './Calendar.css';

const TeamCalendarView = () => {
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateDetails, setSelectedDateDetails] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      const response = await axiosInstance.get(
        `/attendance/all?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      setAttendance(response.data.attendance);
      setSelectedDateDetails([]);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    const details = attendance.filter((att) => {
      const attDate = new Date(att.date).toISOString().split('T')[0];
      return attDate === dateStr;
    });
    setSelectedDateDetails(details);
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const dayAttendance = attendance.filter((a) => {
        const attDate = new Date(a.date).toISOString().split('T')[0];
        return attDate === dateStr;
      });
      if (dayAttendance.length > 0) {
        const hasPresent = dayAttendance.some((a) => a.status === 'present');
        const hasLate = dayAttendance.some((a) => a.status === 'late');
        if (hasPresent) return 'calendar-tile-present';
        if (hasLate) return 'calendar-tile-late';
        return 'calendar-tile-absent';
      }
    }
    return null;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="calendar-page">
      <div className="page-header">
        <h1>Team Calendar View</h1>
        <p>View team attendance in calendar format</p>
      </div>

      <div className="calendar-content">
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
              <span className="legend-color absent"></span>
              <span>Absent</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h2>Date Details</h2>
          {selectedDateDetails.length > 0 ? (
            <div className="details-list">
              {selectedDateDetails.map((att) => (
                <div key={att._id} className="details-card">
                  <div className="detail-item">
                    <span className="detail-label">Employee:</span>
                    <span className="detail-value">
                      {att.userId.name} ({att.userId.employeeId})
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">{att.userId.department}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Check In:</span>
                    <span className="detail-value">
                      {att.checkInTime
                        ? new Date(att.checkInTime).toLocaleTimeString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Check Out:</span>
                    <span className="detail-value">
                      {att.checkOutTime
                        ? new Date(att.checkOutTime).toLocaleTimeString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge status-${att.status}`}>
                      {att.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-details">
              <p>Click on a date to view team attendance details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCalendarView;


