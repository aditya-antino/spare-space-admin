import { ROUTES } from "@/constants";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const ProtectedRoute = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.user.user);
  const roles = user?.roles || [];
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  const isMarketing = roles.includes("marketing");
  const isAdmin = roles.includes("admin");

  if (isMarketing && !isAdmin) {
    const isAllowed =
      location.pathname.startsWith("/dashboard/blogs") ||
      location.pathname.startsWith("/dashboard/articles") ||
      location.pathname.startsWith("/dashboard/profile") ||
      location.pathname.startsWith("/dashboard/cancellationPolicy") ||
      location.pathname.startsWith("/dashboard/privacyPolicy") ||
      location.pathname.startsWith("/dashboard/termsAndConditions");

    if (!isAllowed) {
      return <Navigate to={ROUTES.blogs} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
