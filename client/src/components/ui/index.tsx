import { cn } from "../../lib/apiClient";

export function Card({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn("panel p-4", onClick && "cursor-pointer hover:border-primary/50", className)}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const variants = {
    primary: "bg-primary text-[#1a1917] hover:bg-primary-hover font-medium",
    secondary: "panel-inset hover:border-primary/60 text-[var(--text)]",
    ghost: "hover:bg-surface-raised border border-transparent",
    danger: "border border-critical/40 bg-surface text-critical hover:bg-critical/10",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm transition disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "ok" | "warn" | "critical" | "live";
}) {
  const tones = {
    default: "border-border bg-surface-raised text-muted",
    ok: "border-ok/50 bg-ok/10 text-ok",
    warn: "border-warn/50 bg-warn/10 text-warn",
    critical: "border-critical/50 bg-critical/10 text-critical",
    live: "border-warn/60 bg-warn/10 text-warn font-mono",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 border px-2 py-0.5 text-[11px] uppercase tracking-wide", tones[tone])}>
      {children}
    </span>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full border border-border bg-surface px-3 py-2 font-mono text-sm outline-none focus:border-primary"
      {...props}
    />
  );
}

export function StatusPill({ status }: { status: "OK" | "WARN" | "CRITICAL" }) {
  const map = { OK: "ok", WARN: "warn", CRITICAL: "critical" } as const;
  return <Badge tone={map[status]}>{status}</Badge>;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 h-full w-full max-w-md overflow-y-auto border-l border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-mono text-sm uppercase tracking-wider">{title}</h2>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
