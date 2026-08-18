import { useEffect } from "react";
import { useSettingsStore } from "../stores/liveStore";
import { useLiveStore } from "../stores/liveStore";
import { PageHeader } from "../components/DashboardWidgets";
import { Button, Card } from "../components/ui";

export function SettingsPage() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const pollIntervalSec = useSettingsStore((s) => s.pollIntervalSec);
  const setPollIntervalSec = useSettingsStore((s) => s.setPollIntervalSec);
  const livePausedDefault = useSettingsStore((s) => s.livePausedDefault);
  const setLivePausedDefault = useSettingsStore((s) => s.setLivePausedDefault);
  const warnThreshold = useSettingsStore((s) => s.warnThreshold);
  const criticalThreshold = useSettingsStore((s) => s.criticalThreshold);
  const setWarnThreshold = useSettingsStore((s) => s.setWarnThreshold);
  const setCriticalThreshold = useSettingsStore((s) => s.setCriticalThreshold);
  const setPaused = useLiveStore((s) => s.setPaused);

  useEffect(() => {
    setPaused(livePausedDefault);
  }, [livePausedDefault, setPaused]);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Customize theme, polling, and alert thresholds" />

      <div className="grid max-w-2xl gap-6">
        <Card>
          <h3 className="label-caps mb-3">Display mode</h3>
          <div className="flex gap-2">
            <Button variant={theme === "light" ? "primary" : "secondary"} onClick={() => setTheme("light")}>
              Floor report
            </Button>
            <Button variant={theme === "dark" ? "primary" : "secondary"} onClick={() => setTheme("dark")}>
              Control room
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Polling Interval</h3>
          <p className="mb-3 text-sm text-muted">How often Analytics and Alerts fetch aggregated data.</p>
          <div className="flex gap-2">
            {([5, 10, 15] as const).map((sec) => (
              <Button
                key={sec}
                variant={pollIntervalSec === sec ? "primary" : "secondary"}
                onClick={() => setPollIntervalSec(sec)}
              >
                {sec}s
              </Button>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Live Stream</h3>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={livePausedDefault}
              onChange={(e) => setLivePausedDefault(e.target.checked)}
              className="rounded"
            />
            Pause live stream by default on dashboard load
          </label>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Alert Thresholds</h3>
          <p className="mb-4 text-sm text-muted">Adjust deviation % thresholds used by the Alerts page.</p>
          <div className="space-y-4">
            <div>
              <label className="mb-1 flex justify-between text-sm">
                <span>Warn threshold</span>
                <span className="font-mono">{warnThreshold}%</span>
              </label>
              <input
                type="range"
                min={5}
                max={50}
                value={warnThreshold}
                onChange={(e) => setWarnThreshold(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label className="mb-1 flex justify-between text-sm">
                <span>Critical threshold</span>
                <span className="font-mono">{criticalThreshold}%</span>
              </label>
              <input
                type="range"
                min={10}
                max={80}
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
