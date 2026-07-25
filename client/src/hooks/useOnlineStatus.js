import { useEffect, useState, useRef } from "react";
import { isServerReachable } from "../offline/core/serverStatus";

/**
 * The single source of truth for "can we sync right now" is a real
 * request to our own backend's /api/health — this works identically
 * whether the API is localhost (dev) or a hosted URL (production),
 * since it naturally fails in both "no internet" and "server down"
 * cases without needing separate environment logic.
 *
 * navigator.onLine is used only as a cheap pre-check to skip an
 * obviously pointless request when the device has no network at
 * all — it never decides the badge state by itself.
 */
const useOnlineStatus = (pollInterval = 5000) => {
  const [isOnline, setIsOnline] = useState(false);
  const checkingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      if (checkingRef.current) return;
      checkingRef.current = true;

      if (!navigator.onLine) {
        if (mounted) setIsOnline(false);
        checkingRef.current = false;
        return;
      }

      try {
        const reachable = await isServerReachable();
        if (mounted) setIsOnline(reachable);
      } catch {
        if (mounted) setIsOnline(false);
      } finally {
        checkingRef.current = false;
      }
    };

    check();

    const interval = setInterval(check, pollInterval);

    window.addEventListener("online", check);
    window.addEventListener("offline", check);

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("online", check);
      window.removeEventListener("offline", check);
    };
  }, [pollInterval]);

  return isOnline;
};

export default useOnlineStatus;