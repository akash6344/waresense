import { Router } from "express";
import { z } from "zod";
import {
  clearAuthCookie,
  getTokenFromRequest,
  logActivity,
  requireAuth,
  setAuthCookie,
  signToken,
  validateCredentials,
  verifyToken,
  DEMO_USER,
} from "../auth/session.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "VALIDATION_ERROR", message: "Invalid credentials format" });
    return;
  }

  const user = await validateCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    res.status(401).json({ code: "INVALID_CREDENTIALS", message: "Invalid email or password" });
    return;
  }

  const { token, expiresAt } = signToken(user);
  setAuthCookie(res, token);
  logActivity("LOGIN", `User ${user.email} signed in`);

  res.json({ user, expiresAt });
});

authRouter.post("/logout", requireAuth, (req, res) => {
  logActivity("LOGOUT", `User ${req.user?.email} signed out`);
  clearAuthCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", (req, res) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ code: "SESSION_EXPIRED", message: "Not authenticated" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ code: "SESSION_EXPIRED", message: "Session expired" });
    return;
  }
  const payloadBody = JSON.parse(Buffer.from(token.split(".")[1]!, "base64").toString()) as {
    exp: number;
  };
  const expiresAt = new Date(payloadBody.exp * 1000).toISOString();

  res.json({
    user: { id: payload.sub, email: payload.email, name: payload.name },
    expiresAt,
  });
});

authRouter.post("/expire", requireAuth, (_req, res) => {
  clearAuthCookie(res);
  logActivity("SESSION_EXPIRED", "Session force-expired for demo");
  res.status(401).json({ code: "SESSION_EXPIRED", message: "Session expired" });
});

authRouter.get("/demo-user", (_req, res) => {
  res.json({ email: DEMO_USER.email, hint: "Password: warehouse123" });
});
