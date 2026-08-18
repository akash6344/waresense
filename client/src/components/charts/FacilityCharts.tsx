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
import type { TrendPoint } from "../../types";

const axisTick = { fontSize: 10 };
const tooltipStyle = { background: "var(--surface)", border: "1px solid var(--border)" };

function formatTime(v: string): string {
  return new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function TemperatureTrendChart({
  data,
  title = "Temperature Trend",
  live = false,
}: {
  data: TrendPoint[];
  title?: string;
  live?: boolean;
}) {
  return (
    <div>
      <h3 className="mb-4 font-semibold">
        {title}
        {live && <span className="ml-2 font-mono text-[10px] font-normal uppercase text-muted">Live</span>}
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="var(--text-muted)"
              tick={axisTick}
            />
            <YAxis stroke="var(--text-muted)" tick={axisTick} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={formatTime}
              formatter={(value: number) => [`${value}°C`, "Temperature"]}
            />
            <Area
              type="monotone"
              dataKey="temperatureC"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.2}
              isAnimationActive={!live}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ThroughputTrendChart({
  data,
  title = "Throughput by Bucket",
  live = false,
}: {
  data: TrendPoint[];
  title?: string;
  live?: boolean;
}) {
  return (
    <div>
      <h3 className="mb-4 font-semibold">
        {title}
        {live && <span className="ml-2 font-mono text-[10px] font-normal uppercase text-muted">Live</span>}
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="var(--text-muted)"
              tick={axisTick}
            />
            <YAxis stroke="var(--text-muted)" tick={axisTick} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={formatTime}
              formatter={(value: number) => [`${value} u/h`, "Throughput"]}
            />
            <Bar
              dataKey="throughputUph"
              fill="var(--accent)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={!live}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function buildLiveTrendPoints(
  events: Array<{ timestamp: string; temperatureC: number; humidityPct: number; throughputUph: number }>,
  maxPoints = 60,
): TrendPoint[] {
  const byTick = new Map<string, { temps: number[]; hums: number[]; thrs: number[] }>();

  for (const e of events) {
    const entry = byTick.get(e.timestamp) ?? { temps: [], hums: [], thrs: [] };
    entry.temps.push(e.temperatureC);
    entry.hums.push(e.humidityPct);
    entry.thrs.push(e.throughputUph);
    byTick.set(e.timestamp, entry);
  }

  const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

  return [...byTick.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-maxPoints)
    .map(([timestamp, { temps, hums, thrs }]) => ({
      timestamp,
      temperatureC: Math.round(avg(temps) * 100) / 100,
      humidityPct: Math.round(avg(hums) * 100) / 100,
      throughputUph: Math.round(avg(thrs)),
    }));
}
