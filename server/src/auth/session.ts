import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { User, SessionActivity } from "../types/index.js";
import { env } from "../config.js";

const DEMO_PASSWORD_HASH = bcrypt.hashSync("warehouse123", 10);

const DEMO_USER: User = {
  id: "user-1",
  email: "operator@waresense.io",
  name: "Warehouse Operator",
};

export interface AuthPayload {
  sub: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

const sessionActivities: SessionActivity[] = [];

export function logActivity(action: string, detail?: string): void {
  sessionActivities.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    action,
    timestamp: new Date().toISOString(),
    detail,
  });
  if (sessionActivities.length > 50) sessionActivities.pop();
}

export function getSessionActivities(): SessionActivity[] {
  return [...sessionActivities];
}

export async function validateCredentials(email: string, password: string): Promise<User | null> {
  if (email !== DEMO_USER.email) return null;
  const valid = await bcrypt.compare(password, DEMO_PASSWORD_HASH);
  return valid ? DEMO_USER : null;
}

export function signToken(user: User): { token: string; expiresAt: string } {
  const expiresIn = env.jwtExpiresIn;
  const token = jwt.sign(
    { sub: user.id, email: user.email, name: user.name } satisfies AuthPayload,
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as SignOptions,
  );
  const decoded = jwt.decode(token) as { exp: number };
  const expiresAt = new Date(decoded.exp * 1000).toISOString();
  return { token, expiresAt };
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, env.jwtSecret) as AuthPayload;
  } catch {
    return null;
  }
}

const COOKIE_NAME = "waresense_token";

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    maxAge: 15 * 60 * 1000,
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME);
}

export function getTokenFromRequest(req: Request): string | null {
  return req.cookies?.[COOKIE_NAME] ?? null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = getTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ code: "SESSION_EXPIRED", message: "Authentication required" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ code: "SESSION_EXPIRED", message: "Session expired or invalid" });
    return;
  }
  req.user = payload;
  next();
}

export { DEMO_USER, COOKIE_NAME };
