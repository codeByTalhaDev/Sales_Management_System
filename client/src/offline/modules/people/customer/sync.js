import * as api from "../../../core/api";
import db from "../../../core/database";

import * as queue from "../../../core/queue";
import * as conflicts from "../../../core/conflicts";
import * as repository from "./repository";

import customerConfig from "./config";

import { SYNC_STATUS, OPERATIONS } from "../../../constants/syncStatus";
import { CONFLICT_TYPES } from "../../../conflicts/conflictTypes";
import { resolveConflict } from "../../../conflicts/conflictResolver";

/**
 * True when the request never reached the server or the server itself
 * is down/unreachable (no response at all, or a gateway-level status
 * like 502/503/504 from a proxy in front of a stopped backend). These
 * are retryable — the client is simply offline right now, which is
 * the expected condition this system exists for, not a real failure.
 *
 * False for a genuine response from the application (400, 404, 409,
 * etc.) — those mean the server actively rejected the request and
 * retrying with the same data would fail again the same way.
 */
const isRetryableError = (error) => {
  if (!error.response) return true; // no response reached at all
  return [502, 503, 504].includes(error.response.status);
};

/**
 * Sync Customer Module
 * Push local pending changes, then pull latest server state.
 */
export const syncCustomers = async () => {
  await pushCustomers();
  await pullCustomers();
};

/**
 * PUSH — send local pending queue operations to the server
 */
const pushCustomers = async () => {
  const pendingQueue = (await queue.getPending()).filter(
    (item) => item.module === customerConfig.module
  );

  for (const item of pendingQueue) {
    try {
      await queue.markProcessing(item.id);

      switch (item.operation) {
        case OPERATIONS.CREATE:
          await syncCreate(item);
          break;

        case OPERATIONS.UPDATE:
          await syncUpdate(item);
          break;

        case OPERATIONS.DELETE:
          await syncDelete(item);
          break;

        default:
          break;
      }

      await queue.remove(item.id);
    } catch (error) {
      if (isRetryableError(error)) {
        // Server unreachable — expected during offline/downtime, not a
        // real failure. Warn instead of error so this doesn't trip
        // error-monitoring tools on every retry interval.
        console.warn(
          "Customer Sync (push) — server unreachable, will retry:",
          error.message
        );

        // Reset back to PENDING so the next sync attempt picks this up
        // again automatically.
        await queue.retry(item.id);
      } else {
        // The server actually responded and rejected this request —
        // retrying with the same data would fail the same way again.
        // This is a real problem worth surfacing loudly.
        console.error("Customer Sync (push) — rejected by server:", error);

        const message =
          error.response?.data?.message || "Failed to sync with server";
        await queue.markFailed(item.id, message);
      }
    }
  }
};

/**
 * PULL — fetch server records into IndexedDB.
 * Local records that are still PENDING (unsynced local edits/creates)
 * are never overwritten by a pulled server copy, so in-flight offline
 * work is never silently lost.
 *
 * Also removes the local copy of any previously-SYNCED record that no
 * longer appears in the server's active list — e.g. it was deleted
 * directly in the database, or deleted from another device. Without
 * this, a customer removed on the server would stay visible forever
 * on every other device, still showing "Synced", with no way for the
 * user to know it's gone.
 */
const pullCustomers = async () => {
  try {
    const response = await api.get(customerConfig.api);
    const serverCustomers = response.customers || [];
    const serverIds = new Set(serverCustomers.map((c) => c.id));

    const store = db.table(customerConfig.store);

    await db.transaction("rw", store, async () => {
      for (const serverCustomer of serverCustomers) {
        const existing = await repository.getByServerId(serverCustomer.id);

        // Never clobber a record with unsynced local changes.
        if (existing && existing.syncStatus === SYNC_STATUS.PENDING) {
          continue;
        }

        if (existing) {
          await store.update(existing.localId, {
            customerName: serverCustomer.customerName,
            contact: serverCustomer.contact,
            cnic: serverCustomer.cnic,
            email: serverCustomer.email,
            address: serverCustomer.address,
            status: serverCustomer.status,
            syncStatus: SYNC_STATUS.SYNCED,
            version: serverCustomer.version,
            isDeleted: 0,
            createdAt: serverCustomer.createdAt,
            updatedAt: serverCustomer.updatedAt,
          });
        } else {
          await store.add({
            id: serverCustomer.id,
            offlineId: serverCustomer.offlineId ?? null,
            customerName: serverCustomer.customerName,
            contact: serverCustomer.contact,
            cnic: serverCustomer.cnic,
            email: serverCustomer.email,
            address: serverCustomer.address,
            status: serverCustomer.status,
            syncStatus: SYNC_STATUS.SYNCED,
            version: serverCustomer.version,
            isDeleted: 0,
            createdAt: serverCustomer.createdAt,
            updatedAt: serverCustomer.updatedAt,
          });
        }
      }

      // Remove local records that were previously confirmed synced
      // (have a real server id) but are no longer in the server's
      // active list — the server is the source of truth for anything
      // it has already accepted, so a record it no longer has must
      // have been deleted there.
      const allLocal = await store.toArray();

      for (const local of allLocal) {
        const wasSyncedFromServer =
          local.id !== null &&
          local.id !== undefined &&
          local.syncStatus === SYNC_STATUS.SYNCED;

        if (wasSyncedFromServer && !serverIds.has(local.id) && !local.isDeleted) {
          await store.update(local.localId, {
            isDeleted: 1,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    });
  } catch (error) {
    // A failed pull (e.g. offline) should not break push sync. This is
    // almost always connectivity-related — warn rather than error to
    // avoid noisy logs during expected offline periods.
    console.warn(
      "Customer Sync (pull) — could not reach server:",
      error.message
    );
  }
};

/**
 * CREATE
 */
const syncCreate = async (queueItem) => {
  const customer = await repository.getByLocalId(queueItem.localId);

  if (!customer) return;

  const payload = {
    customerName: customer.customerName,
    contact: customer.contact,
    cnic: customer.cnic,
    email: customer.email,
    address: customer.address,
    status: customer.status,
    // Lets the server dedupe a retried create (see customerService.js)
    // instead of producing a duplicate row if a prior response was lost.
    offlineId: customer.offlineId,
  };

  const response = await api.post(customerConfig.api, payload);

  await db.table(customerConfig.store).update(queueItem.localId, {
    id: response.customer.id,

    syncStatus: SYNC_STATUS.SYNCED,

    version: response.customer.version,

    updatedAt: response.customer.updatedAt,
  });
};

/**
 * UPDATE
 * On a 409 version conflict, resolve using the existing conflict
 * strategy files, apply the outcome, log it for audit, and — if the
 * resolution favors the local record — force-push the merged data so
 * the sync loop actually completes instead of failing repeatedly.
 */
const syncUpdate = async (queueItem) => {
  const customer = await repository.getByLocalId(queueItem.localId);

  if (!customer) return;

  // Record never reached server
  if (!customer.id) {
    await syncCreate(queueItem);
    return;
  }

  const payload = {
    customerName: customer.customerName,
    contact: customer.contact,
    cnic: customer.cnic,
    email: customer.email,
    address: customer.address,
    status: customer.status,
    version: customer.version,
  };

  try {
    await api.put(`${customerConfig.api}/${customer.id}`, payload);

    await db.table(customerConfig.store).update(queueItem.localId, {
      syncStatus: SYNC_STATUS.SYNCED,

      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error.response?.status === 409) {
      await handleUpdateConflict(customer, error.response.data.customer);
      return;
    }

    throw error;
  }
};

/**
 * Resolve a version conflict between the local record and the
 * server's current record, apply the outcome, and log it.
 */
const handleUpdateConflict = async (localRecord, serverRecord) => {
  const resolved = resolveConflict({
    type: CONFLICT_TYPES.VERSION,
    localRecord,
    serverRecord,
  });

  const localWon = resolved.customerName === localRecord.customerName
    && resolved.contact === localRecord.contact
    && resolved.address === localRecord.address
    && resolved.email === localRecord.email;

  if (localWon) {
    // Force-push the local data on top of the server's newer version
    // so the record converges instead of conflicting again next sync.
    const payload = {
      customerName: resolved.customerName,
      contact: resolved.contact,
      cnic: resolved.cnic,
      email: resolved.email,
      address: resolved.address,
      status: resolved.status,
      version: serverRecord.version + 1,
    };

    await api.put(`${customerConfig.api}/${serverRecord.id}`, payload);

    await db.table(customerConfig.store).update(localRecord.localId, {
      syncStatus: SYNC_STATUS.SYNCED,
      version: serverRecord.version + 1,
      updatedAt: new Date().toISOString(),
    });
  } else {
    // Server's record wins — overwrite the local copy with it.
    await db.table(customerConfig.store).update(localRecord.localId, {
      customerName: serverRecord.customerName,
      contact: serverRecord.contact,
      cnic: serverRecord.cnic,
      email: serverRecord.email,
      address: serverRecord.address,
      status: serverRecord.status,
      syncStatus: SYNC_STATUS.SYNCED,
      version: serverRecord.version,
      updatedAt: serverRecord.updatedAt,
    });
  }

  await conflicts.logConflict({
    module: customerConfig.module,
    localId: localRecord.localId,
    serverId: serverRecord.id,
    type: CONFLICT_TYPES.VERSION,
    localRecord,
    serverRecord,
    resolvedRecord: resolved,
  });
};

/**
 * DELETE
 */
const syncDelete = async (queueItem) => {
  const customer = await repository.getByLocalId(queueItem.localId);

  if (!customer) {
    return;
  }

  if (customer.id) {
    await api.remove(`${customerConfig.api}/${customer.id}`);
  }

  await db.table(customerConfig.store).delete(queueItem.localId);
};