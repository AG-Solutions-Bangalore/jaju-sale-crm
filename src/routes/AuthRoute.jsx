import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "@/hooks/api/use-auth";

import DashboardSkeleton from "@/components/skeletonLoader/DashboardSkeleton";
import { isAuthRoute } from "./common/routePaths";

const AuthRoute = () => {
  const location = useLocation();
  const { data: authData, isLoading } = useAuth();
  const user = authData?.user;

  const _isAuthRoute = isAuthRoute(location.pathname);

  console.log("AuthRoute check:", { isLoading, hasUser: !!user, user, isAuthPath: _isAuthRoute });

  if (isLoading && !_isAuthRoute) return <DashboardSkeleton />;

  if (!user) return <Outlet />;

  console.log("AuthRoute: User exists, redirecting to /sale-dashboard");
  return <Navigate to="/sale-dashboard" replace />;
};

export default AuthRoute;
