import * as api from "../../../core/api";
import db from "../../../core/database";

import * as queue from "../../../core/queue";
import * as conflicts from "../../../core/conflicts";
import * as repository from "./repository";

import supplierConfig from "./config";

import { SYNC_STATUS, OPERATIONS } from "../../../constants/syncStatus";
import { CONFLICT_TYPES } from "../../../conflicts/conflictTypes";
import { resolveConflict } from "../../../conflicts/conflictResolver";

/**
 * True when the request never reached the server or the server itself
 * is down/unreachable (no response at all, or a gateway-level status
 * like 502/503/504). These are retryable — the client is simply
 * offline right now, not a real failure.
 *
 * False for a genuine response from the application (400, 404, 409,
 * etc.) — those mean the server actively rejected the request.
 */
const isRetryableError = (error) => {
  if (!error.response) return true;
  return [502, 503, 504].includes(error.response.status);
};

/**
 * Sync Supplier Module
 * Push local pending changes, then pull latest server state.
 */
export const syncSuppliers = async () => {
  await pushSuppliers();
  await pullSuppliers();
};

/**
 * PUSH — send local pending queue operations to the server
 */
const pushSuppliers = async () => {
  const pendingQueue = (await queue.getPending()).filter(
    (item) => item.module === supplierConfig.module
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
          "Supplier Sync (push) — server unreachable, will retry:",
          error.message
        );

        // Server unreachable — reset back to PENDING so the next sync
        // attempt picks this up automatically. Not a real failure.
        await queue.retry(item.id);
      } else {
        // The server actually rejected this request — retrying with
        // the same data would fail the same way again. This is a real
        // problem worth surfacing loudly.
        console.error("Supplier Sync (push) — rejected by server:", error);

        const message =
          error.response?.data?.message || "Failed to sync with server";
        await queue.markFailed(item.id, message);
      }
    }
  }
};

/**
 * PULL — fetch server records into IndexedDB.
 * Local records that are still PENDING are never overwritten by a
 * pulled server copy. Local records that were previously SYNCED but
 * no longer appear in the server's active list are soft-deleted
 * locally too — the server is the source of truth for anything it
 * has already accepted.
 */
const pullSuppliers = async () => {
  try {
    const response = await api.get(supplierConfig.api);
    const serverSuppliers = response.suppliers || [];
    const serverIds = new Set(serverSuppliers.map((s) => s.id));

    const store = db.table(supplierConfig.store);

    await db.transaction("rw", store, async () => {
      for (const serverSupplier of serverSuppliers) {
        const existing = await repository.getByServerId(serverSupplier.id);

        if (existing && existing.syncStatus === SYNC_STATUS.PENDING) {
          continue;
        }

        if (existing) {
          await store.update(existing.localId, {
            supplierName: serverSupplier.supplierName,
            contact: serverSupplier.contact,
            company: serverSupplier.company,
            email: serverSupplier.email,
            address: serverSupplier.address,
            status: serverSupplier.status,
            syncStatus: SYNC_STATUS.SYNCED,
            version: serverSupplier.version,
            isDeleted: 0,
            createdAt: serverSupplier.createdAt,
            updatedAt: serverSupplier.updatedAt,
          });
        } else {
          await store.add({
            id: serverSupplier.id,
            offlineId: serverSupplier.offlineId ?? null,
            supplierName: serverSupplier.supplierName,
            contact: serverSupplier.contact,
            company: serverSupplier.company,
            email: serverSupplier.email,
            address: serverSupplier.address,
            status: serverSupplier.status,
            syncStatus: SYNC_STATUS.SYNCED,
            version: serverSupplier.version,
            isDeleted: 0,
            createdAt: serverSupplier.createdAt,
            updatedAt: serverSupplier.updatedAt,
          });
        }
      }

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
    // Pull failures are almost always connectivity-related (server
    // down, network drop) — warn rather than error to avoid noisy
    // logs during expected offline periods.
    console.warn(
      "Supplier Sync (pull) — could not reach server:",
      error.message
    );
  }
};

/**
 * CREATE
 */
const syncCreate = async (queueItem) => {
  const supplier = await repository.getByLocalId(queueItem.localId);

  if (!supplier) return;

  const payload = {
    supplierName: supplier.supplierName,
    contact: supplier.contact,
    company: supplier.company,
    email: supplier.email,
    address: supplier.address,
    status: supplier.status,
    offlineId: supplier.offlineId,
  };

  const response = await api.post(supplierConfig.api, payload);

  await db.table(supplierConfig.store).update(queueItem.localId, {
    id: response.supplier.id,
    syncStatus: SYNC_STATUS.SYNCED,
    version: response.supplier.version,
    updatedAt: response.supplier.updatedAt,
  });
};

/**
 * UPDATE
 * On a 409 version conflict, resolve using the existing conflict
 * strategy files, apply the outcome, log it, and — if the resolution
 * favors the local record — force-push the merged data so the sync
 * loop actually completes.
 */
const syncUpdate = async (queueItem) => {
  const supplier = await repository.getByLocalId(queueItem.localId);

  if (!supplier) return;

  if (!supplier.id) {
    await syncCreate(queueItem);
    return;
  }

  const payload = {
    supplierName: supplier.supplierName,
    contact: supplier.contact,
    company: supplier.company,
    email: supplier.email,
    address: supplier.address,
    status: supplier.status,
    version: supplier.version,
  };

  try {
    await api.put(`${supplierConfig.api}/${supplier.id}`, payload);

    await db.table(supplierConfig.store).update(queueItem.localId, {
      syncStatus: SYNC_STATUS.SYNCED,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error.response?.status === 409) {
      await handleUpdateConflict(supplier, error.response.data.supplier);
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

  const localWon = resolved.supplierName === localRecord.supplierName
    && resolved.contact === localRecord.contact
    && resolved.company === localRecord.company
    && resolved.email === localRecord.email;

  if (localWon) {
    const payload = {
      supplierName: resolved.supplierName,
      contact: resolved.contact,
      company: resolved.company,
      email: resolved.email,
      address: resolved.address,
      status: resolved.status,
      version: serverRecord.version + 1,
    };

    await api.put(`${supplierConfig.api}/${serverRecord.id}`, payload);

    await db.table(supplierConfig.store).update(localRecord.localId, {
      syncStatus: SYNC_STATUS.SYNCED,
      version: serverRecord.version + 1,
      updatedAt: new Date().toISOString(),
    });
  } else {
    await db.table(supplierConfig.store).update(localRecord.localId, {
      supplierName: serverRecord.supplierName,
      contact: serverRecord.contact,
      company: serverRecord.company,
      email: serverRecord.email,
      address: serverRecord.address,
      status: serverRecord.status,
      syncStatus: SYNC_STATUS.SYNCED,
      version: serverRecord.version,
      updatedAt: serverRecord.updatedAt,
    });
  }

  await conflicts.logConflict({
    module: supplierConfig.module,
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
  const supplier = await repository.getByLocalId(queueItem.localId);

  if (!supplier) {
    return;
  }

  if (supplier.id) {
    await api.remove(`${supplierConfig.api}/${supplier.id}`);
  }

  await db.table(supplierConfig.store).delete(queueItem.localId);
};