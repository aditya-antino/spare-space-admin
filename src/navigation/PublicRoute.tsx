import { ROUTES } from "@/constants";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );

  // TODO: Change Navigation in PROD
  return !isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={ROUTES.dashboard} replace />
  );
};

export default PublicRoute;
