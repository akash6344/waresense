import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { useSettingsStore } from "./stores/liveStore";
import { ToastProvider, useToast } from "./components/Toast";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AlertsPage } from "./pages/AlertsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";

function SessionWatcher() {
  const status = useAuthStore((s) => s.status);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (status === "expired") {
      showToast("Session expired. Please sign in again.", "error");
      navigate("/login", { state: { reason: "expired" }, replace: true });
    }
  }, [status, navigate, showToast]);

  return null;
}

function AppRoutes() {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <SessionWatcher />
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}
