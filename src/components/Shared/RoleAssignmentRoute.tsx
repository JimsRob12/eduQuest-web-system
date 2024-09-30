import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";

const RoleAssignmentRoute: React.FC = () => {
  const { user, loading } = useAuth();

  console.log(user?.role);
  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.role) {
    return <Navigate to="/role-assignment" />;
  }

  return <Navigate to={`/${user.role}/dashboard`} />;
};

export default RoleAssignmentRoute;
