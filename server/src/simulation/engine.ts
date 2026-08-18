import type { ZoneStatus, EventLabel, TelemetryEvent } from "../types/index.js";
import { ZONES } from "../types/index.js";

interface ZoneState {
  temperatureC: number;
  humidityPct: number;
  throughputUph: number;
  status: ZoneStatus;
}

const ZONE_PROFILES: Record<
  string,
  { tempBase: number; tempRange: number; humBase: number; humRange: number; thrBase: number; thrRange: number }
> = {
  "cold-a": { tempBase: 2, tempRange: 4, humBase: 75, humRange: 10, thrBase: 120, thrRange: 40 },
  "cold-b": { tempBase: 3, tempRange: 4, humBase: 72, humRange: 10, thrBase: 110, thrRange: 35 },
  "dry-goods": { tempBase: 20, tempRange: 5, humBase: 45, humRange: 15, thrBase: 200, thrRange: 60 },
  "loading-bay": { tempBase: 18, tempRange: 6, humBase: 55, humRange: 15, thrBase: 350, thrRange: 80 },
  "packing-line": { tempBase: 22, tempRange: 4, humBase: 50, humRange: 12, thrBase: 280, thrRange: 70 },
  dispatch: { tempBase: 19, tempRange: 5, humBase: 48, humRange: 12, thrBase: 320, thrRange: 75 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function meanRevert(current: number, target: number, strength = 0.06): number {
  return current + (target - current) * strength;
}

function randomWalk(current: number, delta: number, min: number, max: number): number {
  const noise = (Math.random() - 0.5) * delta;
  return clamp(current + noise, min, max);
}

export function deriveStatus(
  temp: number,
  hum: number,
  thr: number,
  profile: (typeof ZONE_PROFILES)[string],
): ZoneStatus {
  const tempDev = Math.abs(temp - profile.tempBase) / profile.tempRange;
  const humDev = Math.abs(hum - profile.humBase) / profile.humRange;
  const thrDev = Math.abs(thr - profile.thrBase) / profile.thrRange;
  const maxDev = Math.max(tempDev, humDev, thrDev);

  if (maxDev > 0.85) return "CRITICAL";
  if (maxDev > 0.55) return "WARN";
  return "OK";
}

export function deriveEventLabel(prev: ZoneStatus, next: ZoneStatus): EventLabel {
  if (prev === next) return "UPDATE";
  if (next === "OK" && (prev === "WARN" || prev === "CRITICAL")) return "RECOVERY";
  return "ALERT";
}

export class SimulationEngine {
  private states: Map<string, ZoneState> = new Map();
  private tickCount = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(event: TelemetryEvent) => void> = new Set();

  constructor() {
    for (const zone of ZONES) {
      const p = ZONE_PROFILES[zone.id]!;
      this.states.set(zone.id, {
        temperatureC: p.tempBase,
        humidityPct: p.humBase,
        throughputUph: p.thrBase,
        status: "OK",
      });
    }
  }

  onEvent(listener: (event: TelemetryEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  start(intervalMs = 1000): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.tick(), intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick(): void {
    this.tickCount++;

    for (const zone of ZONES) {
      const profile = ZONE_PROFILES[zone.id]!;
      const state = this.states.get(zone.id)!;
      const prevStatus = state.status;

      let temp = meanRevert(state.temperatureC, profile.tempBase);
      let hum = meanRevert(state.humidityPct, profile.humBase);
      let thr = meanRevert(state.throughputUph, profile.thrBase);

      temp = randomWalk(temp, 1.8, profile.tempBase - profile.tempRange, profile.tempBase + profile.tempRange);
      hum = randomWalk(hum, 4.5, profile.humBase - profile.humRange, profile.humBase + profile.humRange);
      thr = randomWalk(thr, 35, profile.thrBase - profile.thrRange, profile.thrBase + profile.thrRange);

      // Occasional sensor excursions — visible on charts and status badges
      if (this.tickCount % 12 === 0 && zone.id === ZONES[this.tickCount % ZONES.length]!.id) {
        temp += (Math.random() > 0.5 ? 1 : -1) * profile.tempRange * (0.75 + Math.random() * 0.5);
        hum += (Math.random() > 0.5 ? 1 : -1) * profile.humRange * (0.6 + Math.random() * 0.4);
        thr += (Math.random() > 0.5 ? 1 : -1) * profile.thrRange * (0.4 + Math.random() * 0.3);
      }

      // Small ambient drift so values don't lock to baseline
      if (Math.random() < 0.08) {
        temp += (Math.random() - 0.5) * 2.5;
        hum += (Math.random() - 0.5) * 6;
        thr += (Math.random() - 0.5) * 40;
      }

      temp = clamp(temp, profile.tempBase - profile.tempRange * 1.2, profile.tempBase + profile.tempRange * 1.2);
      hum = clamp(hum, profile.humBase - profile.humRange * 1.2, profile.humBase + profile.humRange * 1.2);
      thr = clamp(thr, profile.thrBase - profile.thrRange * 1.2, profile.thrBase + profile.thrRange * 1.2);

      const status = deriveStatus(temp, hum, thr, profile);
      const eventLabel = deriveEventLabel(prevStatus, status);

      state.temperatureC = Math.round(temp * 10) / 10;
      state.humidityPct = Math.round(hum * 10) / 10;
      state.throughputUph = Math.round(thr);
      state.status = status;

      const event: TelemetryEvent = {
        zoneId: zone.id,
        zoneName: zone.name,
        temperatureC: state.temperatureC,
        humidityPct: state.humidityPct,
        throughputUph: state.throughputUph,
        status,
        eventLabel,
        timestamp: new Date().toISOString(),
      };

      for (const listener of this.listeners) {
        listener(event);
      }
    }
  }
}

export const simulationEngine = new SimulationEngine();
