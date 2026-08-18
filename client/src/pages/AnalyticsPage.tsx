import { useCallback, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DashboardSummary, TrendsResponse } from "../types";
import { apiClient, formatRelativeTime } from "../lib/apiClient";
import { usePolling } from "../hooks/useData";
import { useSettingsStore } from "../stores/liveStore";
import { MetricTile, PageHeader } from "../components/DashboardWidgets";
import { Button, Card } from "../components/ui";

export function AnalyticsPage() {
  const pollIntervalSec = useSettingsStore((s) => s.pollIntervalSec);
  const [range, setRange] = useState<"5m" | "15m">("5m");

  const fetchSummary = useCallback(() => apiClient<DashboardSummary>("/api/dashboard/summary"), []);
  const fetchTrends = useCallback(
    () => apiClient<TrendsResponse>(`/api/dashboard/trends?range=${range}`),
    [range],
  );

  const summary = usePolling(fetchSummary, pollIntervalSec * 1000);
  const trends = usePolling(fetchTrends, pollIntervalSec * 1000);

  const facility = summary.data?.facility;

  return (
    <div>
      <PageHeader
        title="Analytics & Trends"
        subtitle="Aggregated warehouse metrics from periodic polling"
        action={
          <span className="text-sm text-muted">
            Last updated: {formatRelativeTime(summary.lastUpdatedAt)}
          </span>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Facility Avg Temp"
          value={facility?.avgTemperatureC ?? "—"}
          unit="°C"
          delta={facility?.temperatureDeltaPct}
        />
        <MetricTile
          label="Facility Avg Humidity"
          value={facility?.avgHumidityPct ?? "—"}
          unit="%"
          delta={facility?.humidityDeltaPct}
        />
        <MetricTile
          label="Total Throughput"
          value={facility?.totalThroughputUph ?? "—"}
          unit="u/h"
          delta={facility?.throughputDeltaPct}
        />
        <MetricTile label="Active Zones" value={facility?.activeZones ?? "—"} unit={`/ ${facility?.totalZones ?? 6}`} />
      </div>

      <div className="mb-4 flex gap-2">
        <Button variant={range === "5m" ? "primary" : "secondary"} onClick={() => setRange("5m")}>
          5 min
        </Button>
        <Button variant={range === "15m" ? "primary" : "secondary"} onClick={() => setRange("15m")}>
          15 min
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Temperature Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.data?.points ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
                <Area type="monotone" dataKey="temperatureC" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Throughput by Bucket</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends.data?.points ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
                <Bar dataKey="throughputUph" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="mb-4 font-semibold">Zone Summary (60s window)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="pb-2 pr-4">Zone</th>
                <th className="pb-2 pr-4">Temp Avg</th>
                <th className="pb-2 pr-4">Humidity Avg</th>
                <th className="pb-2 pr-4">Throughput Avg</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.data?.zones.map((z) => (
                <tr key={z.zoneId} className="border-b border-border/50">
                  <td className="py-2 pr-4">{z.zoneName}</td>
                  <td className="py-2 pr-4 font-mono">{z.temperature.avg}°C ({z.temperature.deltaPct}%)</td>
                  <td className="py-2 pr-4 font-mono">{z.humidity.avg}% ({z.humidity.deltaPct}%)</td>
                  <td className="py-2 pr-4 font-mono">{z.throughput.avg} u/h</td>
                  <td className="py-2">{z.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
