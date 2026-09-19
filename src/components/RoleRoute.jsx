import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getUserRole, isRoleAllowed } from '../utils/rbac';

const RoleRoute = ({ allowedRoles = [] }) => {
  const role = getUserRole();

  if (!isRoleAllowed(role, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
