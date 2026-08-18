import { useCallback, useMemo, useState } from "react";
import type { AlertItem, AlertsResponse } from "../types";
import { ZONES } from "../types";
import { apiClient, formatRelativeTime } from "../lib/apiClient";
import { usePolling } from "../hooks/useData";
import { useSettingsStore } from "../stores/liveStore";
import { PageHeader } from "../components/DashboardWidgets";
import { Badge, Card, Drawer, Input, StatusPill } from "../components/ui";

type SortKey = "timestamp" | "severity" | "zoneName";

export function AlertsPage() {
  const pollIntervalSec = useSettingsStore((s) => s.pollIntervalSec);
  const warnThreshold = useSettingsStore((s) => s.warnThreshold);
  const criticalThreshold = useSettingsStore((s) => s.criticalThreshold);

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<"all" | "warn" | "critical">("all");
  const [zoneFilter, setZoneFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<AlertItem | null>(null);

  const fetchAlerts = useCallback(() => {
    const params = new URLSearchParams({
      warn: String(warnThreshold),
      critical: String(criticalThreshold),
      severity,
    });
    if (zoneFilter) params.set("zone", zoneFilter);
    return apiClient<AlertsResponse>(`/api/dashboard/alerts?${params}`);
  }, [warnThreshold, criticalThreshold, severity, zoneFilter]);

  const { data, lastUpdatedAt } = usePolling(fetchAlerts, pollIntervalSec * 1000);

  const filtered = useMemo(() => {
    let list = data?.alerts ?? [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) => a.zoneName.toLowerCase().includes(q) || a.message.toLowerCase().includes(q),
      );
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "timestamp") cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      else if (sortKey === "severity") cmp = a.severity.localeCompare(b.severity);
      else cmp = a.zoneName.localeCompare(b.zoneName);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [data, search, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Alerts & Events"
        subtitle="Derived alerts from threshold analysis (polled)"
        action={<span className="text-sm text-muted">Last updated: {formatRelativeTime(lastUpdatedAt)}</span>}
      />

      <Card className="mb-6">
        <div className="flex flex-wrap gap-3">
          <Input placeholder="Search alerts…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as typeof severity)}
            className="border border-border bg-surface px-3 py-2 font-mono text-sm"
          >
            <option value="all">All severities</option>
            <option value="warn">Warn</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="border border-border bg-surface px-3 py-2 font-mono text-sm"
          >
            <option value="">All zones</option>
            {ZONES.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="cursor-pointer pb-2 pr-4" onClick={() => toggleSort("zoneName")}>
                  Zone {sortKey === "zoneName" && (sortAsc ? "↑" : "↓")}
                </th>
                <th className="cursor-pointer pb-2 pr-4" onClick={() => toggleSort("severity")}>
                  Severity {sortKey === "severity" && (sortAsc ? "↑" : "↓")}
                </th>
                <th className="pb-2 pr-4">Message</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="cursor-pointer pb-2" onClick={() => toggleSort("timestamp")}>
                  Time {sortKey === "timestamp" && (sortAsc ? "↑" : "↓")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => (
                <tr
                  key={alert.id}
                  className="cursor-pointer border-b border-border/50 hover:bg-surface-raised"
                  onClick={() => setSelected(alert)}
                >
                  <td className="py-2 pr-4">{alert.zoneName}</td>
                  <td className="py-2 pr-4">
                    <Badge tone={alert.severity === "critical" ? "critical" : "warn"}>{alert.severity}</Badge>
                  </td>
                  <td className="max-w-md truncate py-2 pr-4">{alert.message}</td>
                  <td className="py-2 pr-4">
                    <StatusPill status={alert.status} />
                  </td>
                  <td className="py-2 font-mono text-xs">{formatRelativeTime(alert.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="py-8 text-center text-muted">No alerts match your filters.</p>}
        </div>
      </Card>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Alert Details">
        {selected && (
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-muted">Zone:</span> {selected.zoneName}
            </p>
            <p>
              <span className="text-muted">Severity:</span> {selected.severity}
            </p>
            <p>
              <span className="text-muted">Metric:</span> {selected.metric} = {selected.value}
            </p>
            <p>
              <span className="text-muted">Threshold:</span> {selected.threshold}%
            </p>
            <p>
              <span className="text-muted">Status:</span> {selected.status}
            </p>
            <p>
              <span className="text-muted">Message:</span> {selected.message}
            </p>
            <p>
              <span className="text-muted">Timestamp:</span> {new Date(selected.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
