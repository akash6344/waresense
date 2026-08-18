import { describe, it, expect } from "vitest";
import type { TelemetryEvent } from "../src/types/index.js";
import { buildAlerts, buildSummary, buildTrends } from "../src/services/aggregation.js";

function makeEvent(overrides: Partial<TelemetryEvent> & { zoneId: string; zoneName: string }): TelemetryEvent {
  return {
    temperatureC: 20,
    humidityPct: 55,
    throughputUph: 200,
    status: "OK",
    eventLabel: "UPDATE",
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe("buildSummary", () => {
  it("computes facility averages from events", () => {
    const now = Date.now();
    const events: TelemetryEvent[] = [
      makeEvent({ zoneId: "a", zoneName: "A", temperatureC: 10, humidityPct: 50, throughputUph: 100, timestamp: new Date(now - 1000).toISOString() }),
      makeEvent({ zoneId: "b", zoneName: "B", temperatureC: 20, humidityPct: 60, throughputUph: 200, timestamp: new Date(now - 2000).toISOString() }),
    ];

    const summary = buildSummary(events);
    expect(summary.facility.avgTemperatureC).toBe(15);
    expect(summary.facility.totalZones).toBe(6);
  });
});

describe("buildAlerts", () => {
  it("derives warn alerts from deviation thresholds", () => {
    const events = [
      makeEvent({
        zoneId: "cold-a",
        zoneName: "Cold Storage A",
        temperatureC: 50,
        status: "WARN",
        eventLabel: "ALERT",
      }),
    ];

    const alerts = buildAlerts(events, 10, 30);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts.some((a) => a.severity === "warn" || a.severity === "critical")).toBe(true);
  });
});

describe("buildTrends", () => {
  it("returns bucketed points for range", () => {
    const now = Date.now();
    const events: TelemetryEvent[] = Array.from({ length: 10 }, (_, i) =>
      makeEvent({
        zoneId: "a",
        zoneName: "A",
        temperatureC: 20 + i,
        timestamp: new Date(now - i * 10000).toISOString(),
      }),
    );

    const trends = buildTrends(events, "5m");
    expect(trends.range).toBe("5m");
    expect(trends.points.length).toBeGreaterThan(0);
  });
});
