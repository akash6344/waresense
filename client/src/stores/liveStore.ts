import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TelemetryEvent } from "../types";

type ConnectionState = "disconnected" | "connecting" | "connected" | "paused";

interface LiveState {
  events: TelemetryEvent[];
  latestByZone: Record<string, TelemetryEvent>;
  connectionState: ConnectionState;
  isPaused: boolean;
  lastEventAt: string | null;
  addEvent: (event: TelemetryEvent) => void;
  setConnectionState: (state: ConnectionState) => void;
  setPaused: (paused: boolean) => void;
  clear: () => void;
}

const MAX_EVENTS = 120;

export const useLiveStore = create<LiveState>((set) => ({
  events: [],
  latestByZone: {},
  connectionState: "disconnected",
  isPaused: false,
  lastEventAt: null,

  addEvent: (event) =>
    set((s) => ({
      events: [event, ...s.events].slice(0, MAX_EVENTS),
      latestByZone: { ...s.latestByZone, [event.zoneId]: event },
      lastEventAt: event.timestamp,
    })),

  setConnectionState: (connectionState) => set({ connectionState }),
  setPaused: (isPaused) => set({ isPaused, connectionState: isPaused ? "paused" : "connecting" }),
  clear: () => set({ events: [], latestByZone: {}, lastEventAt: null, connectionState: "disconnected" }),
}));

interface SettingsState {
  theme: "light" | "dark";
  pollIntervalSec: 5 | 10 | 15;
  livePausedDefault: boolean;
  warnThreshold: number;
  criticalThreshold: number;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setPollIntervalSec: (sec: 5 | 10 | 15) => void;
  setLivePausedDefault: (v: boolean) => void;
  setWarnThreshold: (v: number) => void;
  setCriticalThreshold: (v: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: "light",
      pollIntervalSec: 10,
      livePausedDefault: false,
      warnThreshold: 15,
      criticalThreshold: 35,

      setTheme: (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        set({ theme: next });
      },
      setPollIntervalSec: (pollIntervalSec) => set({ pollIntervalSec }),
      setLivePausedDefault: (livePausedDefault) => set({ livePausedDefault }),
      setWarnThreshold: (warnThreshold) => set({ warnThreshold }),
      setCriticalThreshold: (criticalThreshold) => set({ criticalThreshold }),
    }),
    {
      name: "waresense-settings-v2",
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute("data-theme", state.theme);
        }
      },
    },
  ),
);
