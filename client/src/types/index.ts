export type ZoneStatus = "OK" | "WARN" | "CRITICAL";
export type EventLabel = "UPDATE" | "ALERT" | "RECOVERY";
export type Severity = "warn" | "critical";

export interface Zone {
  id: string;
  name: string;
}

export interface TelemetryEvent {
  zoneId: string;
  zoneName: string;
  temperatureC: number;
  humidityPct: number;
  throughputUph: number;
  status: ZoneStatus;
  eventLabel: EventLabel;
  timestamp: string;
}

export interface MetricSummary {
  avg: number;
  min: number;
  max: number;
  deltaPct: number;
}

export interface ZoneSummary {
  zoneId: string;
  zoneName: string;
  temperature: MetricSummary;
  humidity: MetricSummary;
  throughput: MetricSummary;
  status: ZoneStatus;
}

export interface DashboardSummary {
  windowSeconds: number;
  generatedAt: string;
  facility: {
    activeZones: number;
    totalZones: number;
    avgTemperatureC: number;
    avgHumidityPct: number;
    totalThroughputUph: number;
    temperatureDeltaPct: number;
    humidityDeltaPct: number;
    throughputDeltaPct: number;
  };
  zones: ZoneSummary[];
}

export interface AlertItem {
  id: string;
  zoneId: string;
  zoneName: string;
  severity: Severity;
  metric: "temperatureC" | "humidityPct" | "throughputUph";
  value: number;
  threshold: number;
  message: string;
  status: ZoneStatus;
  timestamp: string;
}

export interface AlertsResponse {
  generatedAt: string;
  thresholds: { warn: number; critical: number };
  alerts: AlertItem[];
}

export interface TrendPoint {
  timestamp: string;
  temperatureC: number;
  humidityPct: number;
  throughputUph: number;
}

export interface TrendsResponse {
  range: "5m" | "15m";
  generatedAt: string;
  points: TrendPoint[];
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface SessionActivityResponse {
  generatedAt: string;
  activities: SessionActivity[];
}

export interface SessionActivity {
  id: string;
  action: string;
  timestamp: string;
  detail?: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export const ZONES: Zone[] = [
  { id: "cold-a", name: "Cold Storage A" },
  { id: "cold-b", name: "Cold Storage B" },
  { id: "dry-goods", name: "Dry Goods" },
  { id: "loading-bay", name: "Loading Bay" },
  { id: "packing-line", name: "Packing Line" },
  { id: "dispatch", name: "Dispatch" },
];
