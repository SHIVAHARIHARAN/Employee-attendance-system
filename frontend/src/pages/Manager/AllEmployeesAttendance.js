import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';
import './Attendance.css';

const AllEmployeesAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    status: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get('/attendance/all');
      const uniqueEmployees = [
        ...new Map(
          response.data.attendance.map((att) => [
            att.userId.employeeId,
            att.userId,
          ])
        ).values(),
      ];
      setEmployees(uniqueEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);

      const response = await axiosInstance.get(
        `/attendance/all?${params.toString()}`
      );
      setAttendance(response.data.attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/export?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Error exporting data');
    }
  };

  return (
    <div className="attendance-page">
      <div className="page-header">
        <h1>All Employees Attendance</h1>
        <p>View and filter employee attendance records</p>
      </div>

      <div className="filters-card">
        <h2>Filters</h2>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Employee</label>
            <select
              name="employeeId"
              value={filters.employeeId}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleExport}>
          Export to CSV
        </button>
      </div>

      <div className="attendance-table-card">
        <h2>Attendance Records</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="attendance-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length > 0 ? (
                  attendance.map((att) => (
                    <tr key={att._id}>
                      <td>{new Date(att.date).toLocaleDateString()}</td>
                      <td>{att.userId.employeeId}</td>
                      <td>{att.userId.name}</td>
                      <td>{att.userId.department}</td>
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
                    <td colSpan="8" style={{ textAlign: 'center' }}>
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllEmployeesAttendance;


