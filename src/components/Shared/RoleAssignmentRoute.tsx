import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";

const RoleAssignmentRoute: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.role) {
    return <Navigate to="/role-assignment" />;
  }

  return <Outlet />;
};

export default RoleAssignmentRoute;
