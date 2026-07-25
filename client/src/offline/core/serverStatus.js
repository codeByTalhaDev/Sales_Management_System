import * as api from "./api";

const HEALTH_TIMEOUT_MS = 3000;

/**
 * Pings our own backend's /api/health to determine real
 * reachability. Uses the same axiosInstance as every other request
 * (via api.js), so it automatically resolves correctly through the
 * Vite dev proxy in development and through Nginx in production —
 * no environment-specific branching needed.
 *
 * Returns a plain boolean — never throws — so callers (like
 * useOnlineStatus) can use it directly without try/catch.
 */
export const isServerReachable = async () => {
  try {
    await api.get("/health", { timeout: HEALTH_TIMEOUT_MS });
    return true;
  } catch {
    return false;
  }
};