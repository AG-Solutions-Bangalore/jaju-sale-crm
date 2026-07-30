import DashboardSkeleton from "@/components/skeletonLoader/DashboardSkeleton";
import useAuth from "@/hooks/api/use-auth";
import { Navigate, Outlet } from "react-router-dom";



const ProtectedRoute = () => {
  const { data: authData, isLoading } = useAuth();
  const user = authData?.user;
   
  console.log("ProtectedRoute auth check:", { isLoading, hasUser: !!user, user });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    console.warn("ProtectedRoute: No user found, redirecting to /");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;