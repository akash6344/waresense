import type {
  AlertItem,
  DashboardSummary,
  MetricSummary,
  TelemetryEvent,
  TrendsResponse,
  ZoneSummary,
} from "../types/index.js";
import { ZONES } from "../types/index.js";

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function min(values: number[]): number {
  return values.length === 0 ? 0 : Math.min(...values);
}

function max(values: number[]): number {
  return values.length === 0 ? 0 : Math.max(...values);
}

function deltaPct(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function buildMetricSummary(current: number[], previous: number[]): MetricSummary {
  return {
    avg: Math.round(avg(current) * 10) / 10,
    min: Math.round(min(current) * 10) / 10,
    max: Math.round(max(current) * 10) / 10,
    deltaPct: deltaPct(avg(current), avg(previous)),
  };
}

function worstStatus(events: TelemetryEvent[]): "OK" | "WARN" | "CRITICAL" {
  if (events.some((e) => e.status === "CRITICAL")) return "CRITICAL";
  if (events.some((e) => e.status === "WARN")) return "WARN";
  return "OK";
}

export function buildSummary(events: TelemetryEvent[], windowSeconds = 60): DashboardSummary {
  const now = Date.now();
  const currentWindow = events.filter(
    (e) => now - new Date(e.timestamp).getTime() <= windowSeconds * 1000,
  );
  const previousWindow = events.filter((e) => {
    const age = now - new Date(e.timestamp).getTime();
    return age > windowSeconds * 1000 && age <= windowSeconds * 2 * 1000;
  });

  const zones: ZoneSummary[] = ZONES.map((zone) => {
    const current = currentWindow.filter((e) => e.zoneId === zone.id);
    const previous = previousWindow.filter((e) => e.zoneId === zone.id);

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      temperature: buildMetricSummary(
        current.map((e) => e.temperatureC),
        previous.map((e) => e.temperatureC),
      ),
      humidity: buildMetricSummary(
        current.map((e) => e.humidityPct),
        previous.map((e) => e.humidityPct),
      ),
      throughput: buildMetricSummary(
        current.map((e) => e.throughputUph),
        previous.map((e) => e.throughputUph),
      ),
      status: worstStatus(current),
    };
  });

  const activeZones = zones.filter((z) => z.status !== "CRITICAL").length;
  const curTemps = currentWindow.map((e) => e.temperatureC);
  const prevTemps = previousWindow.map((e) => e.temperatureC);
  const curHums = currentWindow.map((e) => e.humidityPct);
  const prevHums = previousWindow.map((e) => e.humidityPct);
  const curThrs = currentWindow.map((e) => e.throughputUph);
  const prevThrs = previousWindow.map((e) => e.throughputUph);

  return {
    windowSeconds,
    generatedAt: new Date().toISOString(),
    facility: {
      activeZones,
      totalZones: ZONES.length,
      avgTemperatureC: Math.round(avg(curTemps) * 10) / 10,
      avgHumidityPct: Math.round(avg(curHums) * 10) / 10,
      totalThroughputUph: Math.round(curThrs.reduce((a, b) => a + b, 0)),
      temperatureDeltaPct: deltaPct(avg(curTemps), avg(prevTemps)),
      humidityDeltaPct: deltaPct(avg(curHums), avg(prevHums)),
      throughputDeltaPct: deltaPct(avg(curThrs), avg(prevThrs)),
    },
    zones,
  };
}

export function buildAlerts(
  events: TelemetryEvent[],
  warnThreshold: number,
  criticalThreshold: number,
): AlertItem[] {
  const latestByZone = new Map<string, TelemetryEvent>();
  for (const event of events) {
    latestByZone.set(event.zoneId, event);
  }

  const alerts: AlertItem[] = [];

  for (const event of latestByZone.values()) {
    const metrics: Array<{ metric: AlertItem["metric"]; value: number; base: number }> = [
      { metric: "temperatureC", value: event.temperatureC, base: 20 },
      { metric: "humidityPct", value: event.humidityPct, base: 55 },
      { metric: "throughputUph", value: event.throughputUph, base: 200 },
    ];

    for (const m of metrics) {
      const deviation = Math.abs(m.value - m.base) / m.base;
      let severity: "warn" | "critical" | null = null;
      if (deviation >= criticalThreshold / 100) severity = "critical";
      else if (deviation >= warnThreshold / 100) severity = "warn";

      if (severity) {
        alerts.push({
          id: `${event.zoneId}-${m.metric}-${event.timestamp}`,
          zoneId: event.zoneId,
          zoneName: event.zoneName,
          severity,
          metric: m.metric,
          value: m.value,
          threshold: severity === "critical" ? criticalThreshold : warnThreshold,
          message: `${event.zoneName}: ${m.metric} at ${m.value} exceeds ${severity} threshold`,
          status: event.status,
          timestamp: event.timestamp,
        });
      }
    }

    if (event.eventLabel === "ALERT" && event.status !== "OK") {
      alerts.push({
        id: `event-${event.zoneId}-${event.timestamp}`,
        zoneId: event.zoneId,
        zoneName: event.zoneName,
        severity: event.status === "CRITICAL" ? "critical" : "warn",
        metric: "temperatureC",
        value: event.temperatureC,
        threshold: warnThreshold,
        message: `${event.zoneName} entered ${event.status} state`,
        status: event.status,
        timestamp: event.timestamp,
      });
    }
  }

  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function buildTrends(events: TelemetryEvent[], range: "5m" | "15m"): TrendsResponse {
  const rangeMs = range === "5m" ? 5 * 60 * 1000 : 15 * 60 * 1000;
  const bucketMs = range === "5m" ? 30 * 1000 : 60 * 1000;
  const cutoff = Date.now() - rangeMs;
  const filtered = events.filter((e) => new Date(e.timestamp).getTime() >= cutoff);

  const buckets = new Map<number, TelemetryEvent[]>();
  for (const event of filtered) {
    const t = new Date(event.timestamp).getTime();
    const bucket = Math.floor(t / bucketMs) * bucketMs;
    const list = buckets.get(bucket) ?? [];
    list.push(event);
    buckets.set(bucket, list);
  }

  const points = [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([ts, evts]) => {
      // Average per tick first, then across ticks in bucket — proper facility-wide signal
      const perTick = new Map<string, TelemetryEvent[]>();
      for (const e of evts) {
        const tick = e.timestamp;
        const list = perTick.get(tick) ?? [];
        list.push(e);
        perTick.set(tick, list);
      }
      const tickAvgs = [...perTick.values()].map((tickEvts) => ({
        temperatureC: avg(tickEvts.map((e) => e.temperatureC)),
        humidityPct: avg(tickEvts.map((e) => e.humidityPct)),
        throughputUph: avg(tickEvts.map((e) => e.throughputUph)),
      }));
      return {
        timestamp: new Date(ts).toISOString(),
        temperatureC: Math.round(avg(tickAvgs.map((t) => t.temperatureC)) * 100) / 100,
        humidityPct: Math.round(avg(tickAvgs.map((t) => t.humidityPct)) * 100) / 100,
        throughputUph: Math.round(avg(tickAvgs.map((t) => t.throughputUph))),
      };
    });

  return {
    range,
    generatedAt: new Date().toISOString(),
    points,
  };
}
