import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, BarChart3, Bell, Settings, User, LogOut, Sun, Moon } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useSettingsStore } from "../stores/liveStore";
import { Button } from "./ui";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useSettingsStore((s) => s.theme);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-canvas flex min-h-screen">
      <aside className="flex w-56 flex-col border-r border-border bg-surface">
        <div className="border-b border-border px-4 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Facility</p>
          <p className="mt-0.5 text-base font-semibold tracking-tight">WareSense</p>
          <p className="font-mono text-[11px] text-muted">WH-OPS / MONITOR</p>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `mb-0.5 flex items-center gap-2.5 border-l-2 px-3 py-2 text-sm transition ${
                  isActive
                    ? "border-l-primary bg-surface-raised font-medium text-[var(--text)]"
                    : "border-l-transparent text-muted hover:border-l-border hover:bg-surface-raised/60 hover:text-[var(--text)]"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0 opacity-70" strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <p className="truncate text-sm">{user?.name}</p>
          <p className="truncate font-mono text-[11px] text-muted">{user?.email}</p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-5 py-2.5">
          <div>
            <p className="label-caps">Operations console</p>
            <h1 className="text-base font-semibold">Warehouse floor monitor</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
