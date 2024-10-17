import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    const destination =
      location.state?.from ||
      (user.role === "professor"
        ? "/professor/dashboard"
        : "/student/dashboard");
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
