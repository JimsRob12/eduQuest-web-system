import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthProvider";

const PublicRoute = () => {
  const authContext = useContext(AuthContext);

  if (authContext && authContext.user) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default PublicRoute;
