import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Button, Card, Input } from "../components/ui";
import { useToast } from "../components/Toast";

export function LoginPage() {
  const [email, setEmail] = useState("operator@waresense.io");
  const [password, setPassword] = useState("warehouse123");
  const login = useAuthStore((s) => s.login);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const from = (location.state as { from?: { pathname: string }; reason?: string } | null)?.from?.pathname ?? "/dashboard";
  const reason = (location.state as { reason?: string } | null)?.reason;

  useEffect(() => {
    if (reason === "expired") {
      showToast("Session ended. Sign in again.", "error");
    }
  }, [reason, showToast]);

  useEffect(() => {
    if (status === "authenticated") {
      navigate(from, { replace: true });
    }
  }, [status, navigate, from]);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-muted">
        Loading session…
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      /* error in store */
    }
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <div className="hidden w-[42%] flex-col justify-between border-r border-border bg-surface p-10 lg:flex">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Internal system</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">WareSense</h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            Zone telemetry for cold storage, loading bays, and dispatch lines. Readings refresh every second from
            floor sensors.
          </p>
        </div>
        <dl className="space-y-2 border-t border-border pt-6 font-mono text-[11px] text-muted">
          <div className="flex justify-between">
            <dt>Site</dt>
            <dd className="text-[var(--text)]">WH-NORTH-04</dd>
          </div>
          <div className="flex justify-between">
            <dt>Zones</dt>
            <dd className="text-[var(--text)]">6 monitored</dd>
          </div>
          <div className="flex justify-between">
            <dt>Revision</dt>
            <dd className="text-[var(--text)]">2026.08</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Card className="p-6">
            <p className="label-caps">Operator access</p>
            <h2 className="mt-1 text-lg font-semibold">Sign in</h2>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="label-caps mb-1 block">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label-caps mb-1 block">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="font-mono text-xs text-critical">{error}</p>}
              <p className="font-mono text-[10px] text-muted">Demo — operator@waresense.io / warehouse123</p>
              <Button type="submit" className="w-full" disabled={status === "authenticating"}>
                {status === "authenticating" ? "Checking…" : "Enter console"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
