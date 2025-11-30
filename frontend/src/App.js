import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import EmployeeLogin from './pages/Employee/EmployeeLogin';
import EmployeeRegister from './pages/Employee/EmployeeRegister';
import ManagerLogin from './pages/Manager/ManagerLogin';
import ManagerRegister from './pages/Manager/ManagerRegister';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import MarkAttendance from './pages/Employee/MarkAttendance';
import MyAttendanceHistory from './pages/Employee/MyAttendanceHistory';
import Profile from './pages/Employee/Profile';
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import AllEmployeesAttendance from './pages/Manager/AllEmployeesAttendance';
import TeamCalendarView from './pages/Manager/TeamCalendarView';
import Reports from './pages/Manager/Reports';
import LandingPage from './pages/LandingPage';

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [token, user, dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/employee/login" element={<EmployeeLogin />} />
      <Route path="/employee/register" element={<EmployeeRegister />} />
      <Route path="/manager/login" element={<ManagerLogin />} />
      <Route path="/manager/register" element={<ManagerRegister />} />
      
      {/* Employee Protected Routes */}
      <Route
        path="/employee/*"
        element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<EmployeeDashboard />} />
                <Route path="attendance" element={<MarkAttendance />} />
                <Route path="history" element={<MyAttendanceHistory />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
      
      {/* Manager Protected Routes */}
      <Route
        path="/manager/*"
        element={
          <PrivateRoute managerOnly>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="attendance" element={<AllEmployeesAttendance />} />
                <Route path="calendar" element={<TeamCalendarView />} />
                <Route path="reports" element={<Reports />} />
                <Route path="*" element={<Navigate to="/manager/dashboard" replace />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;

