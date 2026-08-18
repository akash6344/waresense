import { useMemo } from "react";
import { Pause, Play } from "lucide-react";
import { useLiveStore } from "../stores/liveStore";
import { useTelemetryStream } from "../hooks/useData";
import { LiveIndicator, MetricTile, PageHeader } from "../components/DashboardWidgets";
import {
  buildLiveTrendPoints,
  TemperatureTrendChart,
  ThroughputTrendChart,
} from "../components/charts/FacilityCharts";
import { Button, Card, StatusPill } from "../components/ui";
import { formatRelativeTime } from "../lib/apiClient";

export function DashboardPage() {
  const events = useLiveStore((s) => s.events);
  const latestByZone = useLiveStore((s) => s.latestByZone);
  const connectionState = useLiveStore((s) => s.connectionState);
  const lastEventAt = useLiveStore((s) => s.lastEventAt);
  const isPaused = useLiveStore((s) => s.isPaused);
  const setPaused = useLiveStore((s) => s.setPaused);

  useTelemetryStream(true);

  const facilityMetrics = useMemo(() => {
    const latest = Object.values(latestByZone);
    if (latest.length === 0) return null;
    const avgTemp = latest.reduce((a, e) => a + e.temperatureC, 0) / latest.length;
    const avgHum = latest.reduce((a, e) => a + e.humidityPct, 0) / latest.length;
    const totalThr = latest.reduce((a, e) => a + e.throughputUph, 0);
    const activeZones = latest.filter((e) => e.status !== "CRITICAL").length;
    return {
      avgTemp: avgTemp.toFixed(2),
      avgHum: avgHum.toFixed(2),
      totalThr,
      activeZones,
    };
  }, [latestByZone]);

  const liveTrendData = useMemo(() => buildLiveTrendPoints(events, 60), [events]);

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        subtitle="Live warehouse sensor telemetry across all zones"
        action={
          <div className="flex items-center gap-3">
            <LiveIndicator connectionState={connectionState} lastEventAt={lastEventAt} />
            <Button variant="secondary" onClick={() => setPaused(!isPaused)}>
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Avg Temperature" value={facilityMetrics?.avgTemp ?? "—"} unit="°C" />
        <MetricTile label="Avg Humidity" value={facilityMetrics?.avgHum ?? "—"} unit="%" />
        <MetricTile label="Total Throughput" value={facilityMetrics?.totalThr ?? "—"} unit="u/h" />
        <MetricTile label="Active Zones" value={facilityMetrics?.activeZones ?? "—"} unit={`/ 6`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <TemperatureTrendChart
            data={liveTrendData}
            title="Temperature Trend"
            live
          />
        </Card>
        <Card>
          <ThroughputTrendChart
            data={liveTrendData}
            title="Throughput"
            live
          />
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="mb-4 font-semibold">Live Event Ticker</h3>
        <div className="max-h-40 space-y-2 overflow-y-auto">
          {events.slice(0, 12).map((e) => (
            <div key={`${e.zoneId}-${e.timestamp}`} className="flex items-center justify-between text-sm">
              <span className="truncate">{e.zoneName}</span>
              <span className="font-mono text-xs text-muted">{e.eventLabel}</span>
            </div>
          ))}
          {events.length === 0 && <p className="text-sm text-muted">Waiting for telemetry…</p>}
        </div>
      </Card>

      <Card className="mt-6">
        <h3 className="mb-4 font-semibold">Zone Status Grid</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(latestByZone).map((zone) => (
            <div key={zone.zoneId} className="panel-inset p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{zone.zoneName}</p>
                <StatusPill status={zone.status} />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted">
                <span>{zone.temperatureC}°C</span>
                <span>{zone.humidityPct}%</span>
                <span>{zone.throughputUph} u/h</span>
              </div>
              <p className="mt-1 text-xs text-muted">{formatRelativeTime(zone.timestamp)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
