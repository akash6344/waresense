import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/session.js";
import { telemetryBuffer } from "../data/buffer.js";
import { buildAlerts, buildSummary, buildTrends } from "../services/aggregation.js";
import { getSessionActivities } from "../auth/session.js";
import { simulationEngine } from "../simulation/engine.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/summary", (_req, res) => {
  const summary = buildSummary(telemetryBuffer.getAll());
  res.json(summary);
});

const alertsQuerySchema = z.object({
  warn: z.coerce.number().min(1).max(100).default(15),
  critical: z.coerce.number().min(1).max(100).default(35),
  severity: z.enum(["warn", "critical", "all"]).default("all"),
  zone: z.string().optional(),
});

dashboardRouter.get("/alerts", (req, res) => {
  const parsed = alertsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ code: "VALIDATION_ERROR", message: "Invalid query params" });
    return;
  }

  const { warn, critical, severity, zone } = parsed.data;
  let alerts = buildAlerts(telemetryBuffer.getAll(), warn, critical);

  if (severity !== "all") {
    alerts = alerts.filter((a) => a.severity === severity);
  }
  if (zone) {
    alerts = alerts.filter((a) => a.zoneId === zone);
  }

  res.json({
    generatedAt: new Date().toISOString(),
    thresholds: { warn, critical },
    alerts,
  });
});

dashboardRouter.get("/trends", (req, res) => {
  const range = req.query.range === "15m" ? "15m" : "5m";
  const trends = buildTrends(telemetryBuffer.getAll(), range);
  res.json(trends);
});

dashboardRouter.get("/session/activity", (_req, res) => {
  res.json({
    generatedAt: new Date().toISOString(),
    activities: getSessionActivities(),
  });
});

dashboardRouter.get("/stream/telemetry", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (data: unknown, event = "telemetry") => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  send({ type: "connected", timestamp: new Date().toISOString() }, "connected");

  const unsubscribe = simulationEngine.onEvent((event) => {
    send(event);
  });

  const heartbeat = setInterval(() => {
    send({ timestamp: new Date().toISOString() }, "heartbeat");
  }, 15000);

  req.on("close", () => {
    unsubscribe();
    clearInterval(heartbeat);
  });
});
