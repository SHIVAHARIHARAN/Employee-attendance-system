import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axiosInstance from '../../utils/axios';
import '../Dashboard.css';

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get('/dashboard/manager');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const {
    totalEmployees,
    todayAttendance,
    lateArrivals,
    weeklyTrend,
    departmentWise,
    absentEmployees,
  } = dashboardData || {};

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Manager Dashboard</h1>
        <p>Overview of team attendance and statistics</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Employees</h3>
            <p className="stat-value">{totalEmployees || 0}</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Present Today</h3>
            <p className="stat-value">{todayAttendance?.present || 0}</p>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>Absent Today</h3>
            <p className="stat-value">{todayAttendance?.absent || 0}</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>Late Arrivals</h3>
            <p className="stat-value">{lateArrivals?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h2>Weekly Attendance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#667eea" name="Present" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Department-wise Attendance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentWise || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ department, percentage }) => `${department}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="present"
              >
                {(departmentWise || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lists-section">
        <div className="list-card">
          <h2>Late Arrivals Today</h2>
          {lateArrivals && lateArrivals.length > 0 ? (
            <div className="list-content">
              {lateArrivals.map((emp, index) => (
                <div key={index} className="list-item">
                  <div>
                    <strong>{emp.name}</strong> ({emp.employeeId})
                  </div>
                  <div className="list-detail">
                    {emp.department} • Checked in at{' '}
                    {new Date(emp.checkInTime).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No late arrivals today</p>
          )}
        </div>

        <div className="list-card">
          <h2>Absent Employees Today</h2>
          {absentEmployees && absentEmployees.length > 0 ? (
            <div className="list-content">
              {absentEmployees.map((emp) => (
                <div key={emp.id} className="list-item">
                  <div>
                    <strong>{emp.name}</strong> ({emp.employeeId})
                  </div>
                  <div className="list-detail">{emp.department}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">All employees are present today</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;

