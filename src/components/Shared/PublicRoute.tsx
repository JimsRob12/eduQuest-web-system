import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";

const PublicRoute = () => {
  const { user } = useAuth();

  // use role based routing
  if (user) {
    return <Navigate to="/student/dashboard" />;
  }

  return <Outlet />;
};

export default PublicRoute;
