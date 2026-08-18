import { create } from "zustand";
import type { User } from "../types";
import { apiClient, setSessionExpiredHandler } from "../lib/apiClient";

type AuthStatus = "idle" | "checking" | "authenticating" | "authenticated" | "expired";

interface AuthState {
  user: User | null;
  expiresAt: string | null;
  status: AuthStatus;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  forceExpire: () => Promise<void>;
  handleSessionExpired: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  expiresAt: null,
  status: "idle",
  error: null,

  login: async (email, password) => {
    set({ status: "authenticating", error: null });
    try {
      const data = await apiClient<{ user: User; expiresAt: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        skipSessionHandler: true,
      });
      set({ user: data.user, expiresAt: data.expiresAt, status: "authenticated", error: null });
    } catch (err) {
      set({
        status: "idle",
        error: err instanceof Error ? err.message : "Login failed",
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      await apiClient("/api/auth/logout", { method: "POST" });
    } catch {
      /* session may already be gone */
    }
    set({ user: null, expiresAt: null, status: "idle" });
  },

  checkSession: async () => {
    set({ status: "checking" });
    try {
      const data = await apiClient<{ user: User; expiresAt: string }>("/api/auth/me", {
        skipSessionHandler: true,
      });
      set({ user: data.user, expiresAt: data.expiresAt, status: "authenticated" });
    } catch {
      set({ user: null, expiresAt: null, status: "idle" });
    }
  },

  forceExpire: async () => {
    try {
      await apiClient("/api/auth/expire", { method: "POST" });
    } catch {
      /* expected 401 */
    }
    set({ user: null, expiresAt: null, status: "expired" });
  },

  handleSessionExpired: () => {
    set({ user: null, expiresAt: null, status: "expired" });
  },
}));

setSessionExpiredHandler(() => {
  useAuthStore.getState().handleSessionExpired();
});
