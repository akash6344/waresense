import { useEffect, useRef, useState } from "react";
import type { TelemetryEvent } from "../types";
import { useAuthStore } from "../stores/authStore";
import { useLiveStore } from "../stores/liveStore";

export function useTelemetryStream(enabled = true): void {
  const isPaused = useLiveStore((s) => s.isPaused);
  const addEvent = useLiveStore((s) => s.addEvent);
  const setConnectionState = useLiveStore((s) => s.setConnectionState);
  const status = useAuthStore((s) => s.status);
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef(0);

  useEffect(() => {
    if (!enabled || status !== "authenticated" || isPaused) {
      esRef.current?.close();
      esRef.current = null;
      if (isPaused) setConnectionState("paused");
      else setConnectionState("disconnected");
      return;
    }

    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      setConnectionState("connecting");
      const es = new EventSource("/api/dashboard/stream/telemetry", { withCredentials: true });
      esRef.current = es;

      es.addEventListener("connected", () => {
        retryRef.current = 0;
        setConnectionState("connected");
      });

      es.addEventListener("telemetry", (e) => {
        const data = JSON.parse(e.data) as TelemetryEvent;
        addEvent(data);
      });

      es.onerror = () => {
        es.close();
        esRef.current = null;
        if (cancelled) return;
        setConnectionState("disconnected");
        const delay = Math.min(1000 * 2 ** retryRef.current, 15000);
        retryRef.current += 1;
        setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      cancelled = true;
      esRef.current?.close();
      esRef.current = null;
    };
  }, [enabled, status, isPaused, addEvent, setConnectionState]);
}

export function usePolling<T>(fetcher: () => Promise<T>, intervalMs: number, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let active = true;

    const run = async () => {
      if (document.hidden) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const result = await fetcher();
        if (active) {
          setData(result);
          setLastUpdatedAt(new Date().toISOString());
          setError(null);
        }
      } catch (err) {
        if (active && !(err instanceof DOMException && err.name === "AbortError")) {
          setError(err instanceof Error ? err.message : "Fetch failed");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();
    const id = setInterval(run, intervalMs);

    return () => {
      active = false;
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [fetcher, intervalMs, enabled]);

  return { data, lastUpdatedAt, loading, error };
}
