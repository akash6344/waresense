import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { env } from "./config.js";
import { logger } from "./logger.js";
import { authRouter } from "./routes/auth.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { simulationEngine } from "./simulation/engine.js";
import { telemetryBuffer } from "./data/buffer.js";

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp({ logger }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { code: "RATE_LIMIT", message: "Too many login attempts" },
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", bufferSize: telemetryBuffer.size() });
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);

simulationEngine.onEvent((event) => {
  telemetryBuffer.push(event);
});

simulationEngine.start(1000);

app.listen(env.port, () => {
  logger.info(`WareSense server running on http://localhost:${env.port}`);
});

export default app;
