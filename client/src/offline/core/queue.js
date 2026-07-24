import db from "./database";
import { now } from "../utils/timestamp";
import { SYNC_STATUS, OPERATIONS } from "../constants/syncStatus";

/**
 * Generate unique queue key
 */
const getQueueKey = (module, localId) =>
  `${module}:local_${localId}`;

/**
 * Find existing pending queue item
 */
const findExisting = async (module, localId) => {
  return await db.queue
    .where("queueKey")
    .equals(getQueueKey(module, localId))
    .first();
};

/**
 * Insert new queue operation
 */
const insert = async ({
  module,
  operation,
  localId,
  payload,
}) => {
  return await db.queue.add({
    queueKey: getQueueKey(module, localId),

    module,

    operation,

    localId,

    payload,

    status: SYNC_STATUS.PENDING,

    retryCount: 0,

    createdAt: now(),

    updatedAt: now(),

    lastAttemptAt: null,

    errorMessage: null,
  });
};

/**
 * Replace payload of existing queue item.
 * Always resets status back to PENDING — if this item had previously
 * FAILED (e.g. a rejected duplicate), the user editing the record is
 * exactly the "fix and retry" action, so it must re-enter the sync
 * queue instead of staying permanently stuck as FAILED.
 */
const replacePayload = async (queueItem, payload) => {
  await db.queue.update(queueItem.id, {
    payload,
    status: SYNC_STATUS.PENDING,
    errorMessage: null,
    updatedAt: now(),
  });
};

/**
 * Replace operation and payload. Same PENDING reset as replacePayload.
 */
const replaceOperation = async (
  queueItem,
  operation,
  payload
) => {
  await db.queue.update(queueItem.id, {
    operation,
    payload,
    status: SYNC_STATUS.PENDING,
    errorMessage: null,
    updatedAt: now(),
  });
};

/**
 * Smart enqueue
 */
export const enqueue = async ({
  module,
  operation,
  localId,
  payload,
}) => {
  const existing = await findExisting(
    module,
    localId
  );

  if (!existing) {
    return await insert({
      module,
      operation,
      localId,
      payload,
    });
  }

  // CREATE → UPDATE
  if (
    existing.operation === OPERATIONS.CREATE &&
    operation === OPERATIONS.UPDATE
  ) {
    await replacePayload(existing, payload);
    return;
  }

  // CREATE → DELETE
  if (
    existing.operation === OPERATIONS.CREATE &&
    operation === OPERATIONS.DELETE
  ) {
    await db.queue.delete(existing.id);
    return;
  }

  // UPDATE → UPDATE
  if (
    existing.operation === OPERATIONS.UPDATE &&
    operation === OPERATIONS.UPDATE
  ) {
    await replacePayload(existing, payload);
    return;
  }

  // UPDATE → DELETE
  if (
    existing.operation === OPERATIONS.UPDATE &&
    operation === OPERATIONS.DELETE
  ) {
    await replaceOperation(
      existing,
      OPERATIONS.DELETE,
      payload
    );
    return;
  }

  // DELETE → DELETE
  if (
    existing.operation === OPERATIONS.DELETE &&
    operation === OPERATIONS.DELETE
  ) {
    return;
  }

  // CREATE → CREATE
  if (
    existing.operation === OPERATIONS.CREATE &&
    operation === OPERATIONS.CREATE
  ) {
    await replacePayload(existing, payload);
    return;
  }

  // Fallback
  await replaceOperation(
    existing,
    operation,
    payload
  );
};

/**
 * Get all pending queue items
 */
export const getPending = async () => {
  return await db.queue
    .where("status")
    .equals(SYNC_STATUS.PENDING)
    .sortBy("createdAt");
};

/**
 * Get queue item by id
 */
export const getById = async (id) => {
  return await db.queue.get(id);
};

/**
 * Get queue item by queue key
 */
export const getByQueueKey = async (
  module,
  localId
) => {
  return await db.queue
    .where("queueKey")
    .equals(getQueueKey(module, localId))
    .first();
};

/**
 * Get all queue items for a module (any status) — used to correlate
 * a record with its current sync/failure state in the UI.
 */
export const getByModule = async (module) => {
  return await db.queue.where("module").equals(module).toArray();
};

/**
 * Mark queue item as processing
 */
export const markProcessing = async (id) => {
  return await db.queue.update(id, {
    status: SYNC_STATUS.PROCESSING,
    lastAttemptAt: now(),
    updatedAt: now(),
  });
};

/**
 * Mark queue item as synced
 */
export const markSynced = async (id) => {
  return await db.queue.update(id, {
    status: SYNC_STATUS.SYNCED,
    updatedAt: now(),
  });
};

/**
 * Mark queue item as failed.
 * errorMessage is stored so the UI can tell the user *why* it failed
 * (e.g. "Customer with this contact already exists"), not just that
 * it did.
 */
export const markFailed = async (id, errorMessage = null) => {
  const item = await db.queue.get(id);

  if (!item) return;

  return await db.queue.update(id, {
    status: SYNC_STATUS.FAILED,
    retryCount: item.retryCount + 1,
    lastAttemptAt: now(),
    updatedAt: now(),
    errorMessage,
  });
};

/**
 * Reset failed queue item
 */
export const retry = async (id) => {
  return await db.queue.update(id, {
    status: SYNC_STATUS.PENDING,
    errorMessage: null,
    updatedAt: now(),
  });
};

/**
 * Remove queue item
 */
export const remove = async (id) => {
  return await db.queue.delete(id);
};

/**
 * Clear queue
 */
export const clear = async () => {
  return await db.queue.clear();
};

/**
 * Get all queue items
 */
export const getAll = async () => {
  return await db.queue.toArray();
};

/**
 * Count pending queue items
 */
export const pendingCount = async () => {
  return await db.queue
    .where("status")
    .equals(SYNC_STATUS.PENDING)
    .count();
};