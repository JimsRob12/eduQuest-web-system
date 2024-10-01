import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";

interface RoleAssignmentRouteProps {
  children: ReactNode;
}

const RoleAssignmentRoute: React.FC<RoleAssignmentRouteProps> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.role) {
    return <Navigate to="/role-assignment" />;
  }

  return <>{children}</>;
};

export default RoleAssignmentRoute;
