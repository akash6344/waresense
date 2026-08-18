import { Badge } from "./ui";
import { formatRelativeTime } from "../lib/apiClient";

export function LiveIndicator({
  connectionState,
  lastEventAt,
}: {
  connectionState: string;
  lastEventAt: string | null;
}) {
  const isLive = connectionState === "connected";
  return (
    <div className="flex items-center gap-3 font-mono text-xs">
      {isLive ? (
        <Badge tone="live">
          <span className="live-led inline-block h-1.5 w-1.5 bg-warn" />
          Live feed
        </Badge>
      ) : (
        <Badge tone="default">{connectionState}</Badge>
      )}
      <span className="text-muted">
        Updated{" "}
        <span className="text-[var(--text)]">{formatRelativeTime(lastEventAt)}</span>
      </span>
    </div>
  );
}

export function MetricTile({
  label,
  value,
  unit,
  delta,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
}) {
  return (
    <div className="readout">
      <p className="label-caps">{label}</p>
      <p className="mt-1 font-mono text-2xl font-medium tabular-nums tracking-tight">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-muted">{unit}</span>}
      </p>
      {delta !== undefined && (
        <p className={`mt-1 font-mono text-[11px] ${delta >= 0 ? "text-ok" : "text-critical"}`}>
          {delta >= 0 ? "+" : ""}
          {delta}% prev. window
        </p>
      )}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
