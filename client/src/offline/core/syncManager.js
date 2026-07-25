import { isOnline, onOnline } from "./network";
import modules from "../config/modules";

let syncing = false;

let intervalId = null;

// The name of the custom event broadcast on `window` every time a sync
// cycle finishes — whether it changed anything or not. Any page can
// listen for this to know exactly when to refresh its data, instead
// of guessing or requiring a manual page reload.
export const SYNC_COMPLETE_EVENT = "offline-sync-complete";

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

    // Notify any listening page that a sync cycle just finished, so it
    // can re-fetch and show up-to-date PENDING/SYNCED/FAILED statuses
    // without the user needing to manually refresh.
    window.dispatchEvent(new CustomEvent(SYNC_COMPLETE_EVENT));
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