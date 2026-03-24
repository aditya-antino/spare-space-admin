import { ROUTES } from "@/constants";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const ProtectedRoute = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );

  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.login} replace />;
};

export default ProtectedRoute;
