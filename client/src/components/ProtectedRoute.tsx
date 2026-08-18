import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-muted">
        Loading session…
      </div>
    );
  }

  if (status === "idle" || status === "expired") {
    return <Navigate to="/login" state={{ from: location, reason: status === "expired" ? "expired" : undefined }} replace />;
  }

  return <Outlet />;
}
