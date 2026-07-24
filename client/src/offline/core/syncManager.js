import { isOnline, onOnline } from "./network";
import modules from "../config/modules";

let syncing = false;

let intervalId = null;

/**
 * Check sync status
 */
export const isSyncing = () => syncing;

/**
 * Synchronize all registered modules
 */
export const syncAll = async () => {
  if (!isOnline()) return;

  if (syncing) return;

  syncing = true;

  try {
    for (const module of modules) {
      await module.sync();
    }
  } catch (error) {
    console.error("Sync Manager:", error);
  } finally {
    syncing = false;
  }
};

/**
 * Start automatic synchronization
 */
export const startSyncManager = (
  interval = 30000
) => {
  // Initial sync
  syncAll();

  // Sync when internet returns
  onOnline(syncAll);

  // Periodic sync
  if (!intervalId) {
    intervalId = setInterval(syncAll, interval);
  }
};

/**
 * Stop automatic synchronization
 */
export const stopSyncManager = () => {
  if (!intervalId) return;

  clearInterval(intervalId);

  intervalId = null;
};