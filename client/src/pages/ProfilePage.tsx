import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SessionActivityResponse } from "../types";
import { apiClient, formatRelativeTime } from "../lib/apiClient";
import { useAuthStore } from "../stores/authStore";
import { usePolling } from "../hooks/useData";
import { useToast } from "../components/Toast";
import { PageHeader } from "../components/DashboardWidgets";
import { Button, Card } from "../components/ui";

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const expiresAt = useAuthStore((s) => s.expiresAt);
  const forceExpire = useAuthStore((s) => s.forceExpire);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [countdown, setCountdown] = useState("");

  const fetchActivity = useCallback(
    () => apiClient<SessionActivityResponse>("/api/dashboard/session/activity"),
    [],
  );
  const { data, lastUpdatedAt } = usePolling(fetchActivity, 15000);

  useEffect(() => {
    const tick = () => {
      if (!expiresAt) {
        setCountdown("—");
        return;
      }
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("Expired");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${mins}m ${secs}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const handleForceExpire = async () => {
    await forceExpire();
    showToast("Session expired. Redirecting to login…", "error");
    navigate("/login?reason=expired");
  };

  return (
    <div>
      <PageHeader title="Profile & Session" subtitle="Session activity and account details" />

      <div className="grid max-w-3xl gap-6">
        <Card>
          <h3 className="mb-4 font-semibold">Account</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Name</dt>
              <dd>{user?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Email</dt>
              <dd>{user?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Session expires in</dt>
              <dd className="font-mono">{countdown}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Session Activity</h3>
            <span className="text-xs text-muted">Updated {formatRelativeTime(lastUpdatedAt)}</span>
          </div>
          <ul className="space-y-2">
            {data?.activities.map((a) => (
              <li key={a.id} className="flex justify-between border-b border-border/50 py-2 text-sm">
                <span>
                  {a.action}
                  {a.detail && <span className="ml-2 text-muted">— {a.detail}</span>}
                </span>
                <span className="font-mono text-xs text-muted">{formatRelativeTime(a.timestamp)}</span>
              </li>
            ))}
            {(!data?.activities || data.activities.length === 0) && (
              <li className="text-sm text-muted">No activity recorded yet.</li>
            )}
          </ul>
        </Card>

        <Card>
          <h3 className="mb-2 font-semibold">Demo: Force Session Expiry</h3>
          <p className="mb-4 text-sm text-muted">
            Triggers session expiration to demonstrate safe redirect and cleanup during API calls.
          </p>
          <Button variant="danger" onClick={handleForceExpire}>
            Force Expire Session
          </Button>
        </Card>
      </div>
    </div>
  );
}
