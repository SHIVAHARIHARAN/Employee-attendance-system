import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, managerOnly = false }) => {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (managerOnly && user?.role !== 'manager') {
    return <Navigate to="/employee/dashboard" replace />;
  }

  if (!managerOnly && user?.role === 'manager') {
    return <Navigate to="/manager/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;

