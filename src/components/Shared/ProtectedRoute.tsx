import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthProvider";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const authContext = useContext(AuthContext);

  if (!authContext || !authContext.user) {
    return <Navigate to="/login" />;
  }

  const { user } = authContext;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
