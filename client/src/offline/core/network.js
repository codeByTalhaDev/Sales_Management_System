/**
 * Check current network status
 */
export const isOnline = () => navigator.onLine;

/**
 * Listen for internet connection
 */
export const onOnline = (callback) => {
  window.addEventListener("online", callback);
};

/**
 * Listen for internet disconnection
 */
export const onOffline = (callback) => {
  window.addEventListener("offline", callback);
};

/**
 * Remove internet connection listener
 */
export const offOnline = (callback) => {
  window.removeEventListener("online", callback);
};

/**
 * Remove internet disconnection listener
 */
export const offOffline = (callback) => {
  window.removeEventListener("offline", callback);
};