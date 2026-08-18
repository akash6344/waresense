import type { ApiError } from "../types";

type SessionExpiredHandler = () => void;

let onSessionExpired: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(handler: SessionExpiredHandler): void {
  onSessionExpired = handler;
}

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function apiClient<T>(
  path: string,
  init?: RequestInit & { skipSessionHandler?: boolean },
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    const body = (await res.json().catch(() => ({ code: "SESSION_EXPIRED" }))) as ApiError;
    if (!init?.skipSessionHandler) {
      onSessionExpired?.();
    }
    throw new ApiClientError(body.code, body.message, 401);
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({ code: "ERROR", message: res.statusText }))) as ApiError;
    throw new ApiClientError(body.code, body.message, res.status);
  }

  return res.json() as Promise<T>;
}

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 5000) return "just now";
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return new Date(iso).toLocaleTimeString();
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
