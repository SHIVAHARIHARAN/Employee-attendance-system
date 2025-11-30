import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';
import './Reports.css';

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [month, year]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/attendance/summary?month=${month}&year=${year}`
      );
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/export?startDate=${startDate}&endDate=${endDate}`,
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
      a.download = `attendance-report-${month}-${year}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Error exporting data');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Reports</h1>
        <p>View team attendance summary and export reports</p>
      </div>

      <div className="reports-content">
        <div className="filter-section">
          <div className="filter-group">
            <label>Month</label>
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
          </div>

          <div className="filter-group">
            <label>Year</label>
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

          <button className="btn btn-primary" onClick={handleExport}>
            Export to CSV
          </button>
        </div>

        {summary && (
          <div className="summary-section">
            <h2>Team Summary</h2>
            <div className="summary-grid">
              <div className="summary-card">
                <h3>Total Employees</h3>
                <p className="summary-value">{summary.totalEmployees}</p>
              </div>
              <div className="summary-card">
                <h3>Present Days</h3>
                <p className="summary-value">{summary.present}</p>
              </div>
              <div className="summary-card">
                <h3>Absent Days</h3>
                <p className="summary-value">{summary.absent}</p>
              </div>
              <div className="summary-card">
                <h3>Late Days</h3>
                <p className="summary-value">{summary.late}</p>
              </div>
              <div className="summary-card">
                <h3>Half Days</h3>
                <p className="summary-value">{summary.halfDay}</p>
              </div>
              <div className="summary-card">
                <h3>Total Hours</h3>
                <p className="summary-value">{summary.totalHours} hrs</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;


