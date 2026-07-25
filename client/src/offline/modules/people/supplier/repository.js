import db from "../../../core/database";
import * as queue from "../../../core/queue";

import supplierConfig from "./config";

import { generateOfflineId } from "../../../utils/generateOfflineId";
import { now } from "../../../utils/timestamp";

import { OPERATIONS, SYNC_STATUS } from "../../../constants/syncStatus";

// NOTE: this is deliberately a function, not a top-level constant.
// See the identical note in customer/repository.js — database.js
// circularly imports back to this file via config/modules.js, so
// db.table(...) must be deferred until it's actually called, not run
// at import time.
const store = () => db.table(supplierConfig.store);

const DUPLICATE_FIELD_LABELS = {
  contact: "contact number",
  email: "email",
};

/**
 * Check contact/email for duplicates against IndexedDB, excluding
 * soft-deleted records and (on update) the record being edited itself.
 * Mirrors the same uniqueness rules enforced on the server.
 */
const checkDuplicateFields = async (data, excludeLocalId = null) => {
  const fieldsToCheck = ["contact", "email"];
  const conflicts = [];

  for (const field of fieldsToCheck) {
    const value = data[field];
    if (!value) continue;

    const matches = await store().where(field).equals(value).toArray();

    const conflict = matches.find(
      (record) => !record.isDeleted && record.localId !== excludeLocalId
    );

    if (conflict) {
      conflicts.push(DUPLICATE_FIELD_LABELS[field]);
    }
  }

  if (conflicts.length > 0) {
    const list = conflicts.join(" and ");
    throw new Error(`Supplier with this ${list} already exists`);
  }
};

/**
 * Create Supplier
 */
export const create = async (supplier) => {
  await checkDuplicateFields(supplier);

  const timestamp = now();

  const supplierRecord = {
    id: null,

    offlineId: generateOfflineId(),

    supplierName: supplier.supplierName,

    contact: supplier.contact,

    company: supplier.company ?? null,

    email: supplier.email ?? null,

    address: supplier.address ?? null,

    status: supplier.status ?? "Y",

    syncStatus: SYNC_STATUS.PENDING,

    version: 1,

    // IndexedDB does not support boolean values as index keys,
    // so isDeleted is stored as 0 (false) / 1 (true) instead of true/false.
    isDeleted: 0,

    createdAt: timestamp,

    updatedAt: timestamp,
  };

  let localId;

  await db.transaction("rw", store(), db.queue, async () => {
    localId = await store().add(supplierRecord);

    await queue.enqueue({
      module: supplierConfig.module,

      operation: OPERATIONS.CREATE,

      localId,

      payload: {
        ...supplierRecord,
        localId,
      },
    });
  });

  return await store().get(localId);
};

/**
 * Get All Suppliers
 */
export const getAll = async () => {
  try {
    return await store().where("isDeleted").equals(0).toArray();
  } catch (error) {
    console.error("getAll() failed:", error);

    console.log("Schema:", supplierConfig.schema);
    console.log("Store:", store().name);

    throw error;
  }
};

/**
 * Get Supplier By Local Id
 */
export const getByLocalId = async (localId) => {
  return await store().get(localId);
};

/**
 * Get Supplier By Server Id
 */
export const getByServerId = async (id) => {
  return await store().where("id").equals(id).first();
};

/**
 * Get Supplier By Offline Id
 */
export const getByOfflineId = async (offlineId) => {
  return await store().where("offlineId").equals(offlineId).first();
};

/**
 * Update Supplier
 */
export const update = async (localId, updates) => {
  const supplier = await store().get(localId);

  if (!supplier) {
    throw new Error("Supplier not found.");
  }

  await checkDuplicateFields(updates, localId);

  const updatedSupplier = {
    ...supplier,

    ...updates,

    version: supplier.version + 1,

    syncStatus: SYNC_STATUS.PENDING,

    updatedAt: now(),
  };

  await db.transaction("rw", store(), db.queue, async () => {
    await store().put(updatedSupplier);

    await queue.enqueue({
      module: supplierConfig.module,

      operation: OPERATIONS.UPDATE,

      localId,

      payload: updatedSupplier,
    });
  });

  return await store().get(localId);
};

/**
 * Soft Delete Supplier
 */
export const remove = async (localId) => {
  const supplier = await store().get(localId);

  if (!supplier) {
    throw new Error("Supplier not found.");
  }

  const deletedSupplier = {
    ...supplier,

    // IndexedDB does not support boolean values as index keys,
    // so isDeleted is stored as 0 (false) / 1 (true) instead of true/false.
    isDeleted: 1,

    version: supplier.version + 1,

    syncStatus: SYNC_STATUS.PENDING,

    updatedAt: now(),
  };

  await db.transaction("rw", store(), db.queue, async () => {
    await store().put(deletedSupplier);

    await queue.enqueue({
      module: supplierConfig.module,

      operation: OPERATIONS.DELETE,

      localId,

      payload: deletedSupplier,
    });
  });

  return deletedSupplier;
};