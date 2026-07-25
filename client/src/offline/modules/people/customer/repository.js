import db from "../../../core/database";
import * as queue from "../../../core/queue";

import customerConfig from "./config";

import { generateOfflineId } from "../../../utils/generateOfflineId";
import { now } from "../../../utils/timestamp";

import { OPERATIONS, SYNC_STATUS } from "../../../constants/syncStatus";

// NOTE: this is deliberately a function, not a top-level constant.
// database.js imports config/modules.js (to build the Dexie schema),
// which imports this module's sync.js, which imports this file — a
// circular chain back to database.js. Calling db.table(...) at import
// time (`const store = db.table(...)`) would run before `db` finishes
// being constructed, throwing "Cannot access 'db' before initialization".
// Deferring the lookup into a function means it only runs when actually
// invoked (after the app has finished loading), which is always safe.
const store = () => db.table(customerConfig.store);

const DUPLICATE_FIELD_LABELS = {
  contact: "contact number",
  cnic: "CNIC",
  email: "email",
};

/**
 * Check contact/cnic/email for duplicates against IndexedDB, excluding
 * soft-deleted records and (on update) the record being edited itself.
 * Mirrors the same uniqueness rules enforced on the server.
 *
 * Checks ALL fields before throwing, so if e.g. both contact and email
 * already exist, the user is told about both at once.
 */
const checkDuplicateFields = async (data, excludeLocalId = null) => {
  const fieldsToCheck = ["contact", "cnic", "email"];
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
    const list =
      conflicts.length === 1
        ? conflicts[0]
        : conflicts.length === 2
        ? conflicts.join(" and ")
        : `${conflicts.slice(0, -1).join(", ")} and ${conflicts[conflicts.length - 1]}`;

    throw new Error(`Customer with this ${list} already exists`);
  }
};

/**
 * Create Customer
 */
export const create = async (customer) => {
  await checkDuplicateFields(customer);

  const timestamp = now();

  const customerRecord = {
    id: null,

    offlineId: generateOfflineId(),

    customerName: customer.customerName,

    contact: customer.contact,

    cnic: customer.cnic ?? null,

    email: customer.email ?? null,

    address: customer.address ?? null,

    status: customer.status ?? "Y",

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
    localId = await store().add(customerRecord);

    await queue.enqueue({
      module: customerConfig.module,

      operation: OPERATIONS.CREATE,

      localId,

      payload: {
        ...customerRecord,
        localId,
      },
    });
  });

  return await store().get(localId);
};

/**
 * Get All Customers
 */
export const getAll = async () => {
  try {
    return await store().where("isDeleted").equals(0).toArray();
  } catch (error) {
    console.error("getAll() failed:", error);

    console.log("Schema:", customerConfig.schema);
    console.log("Store:", store().name);

    throw error;
  }
};

/**
 * Get Customer By Local Id
 */
export const getByLocalId = async (localId) => {
  return await store().get(localId);
};

/**
 * Get Customer By Server Id
 */
export const getByServerId = async (id) => {
  return await store().where("id").equals(id).first();
};

/**
 * Get Customer By Offline Id
 */
export const getByOfflineId = async (offlineId) => {
  return await store().where("offlineId").equals(offlineId).first();
};

/**
 * Update Customer
 */
export const update = async (localId, updates) => {
  const customer = await store().get(localId);

  if (!customer) {
    throw new Error("Customer not found.");
  }

  await checkDuplicateFields(updates, localId);

  const updatedCustomer = {
    ...customer,

    ...updates,

    version: customer.version + 1,

    syncStatus: SYNC_STATUS.PENDING,

    updatedAt: now(),
  };

  await db.transaction("rw", store(), db.queue, async () => {
    await store().put(updatedCustomer);

    await queue.enqueue({
      module: customerConfig.module,

      operation: OPERATIONS.UPDATE,

      localId,

      payload: updatedCustomer,
    });
  });

  return await store().get(localId);
};

/**
 * Soft Delete Customer
 */
export const remove = async (localId) => {
  const customer = await store().get(localId);

  if (!customer) {
    throw new Error("Customer not found.");
  }

  const deletedCustomer = {
    ...customer,

    // IndexedDB does not support boolean values as index keys,
    // so isDeleted is stored as 0 (false) / 1 (true) instead of true/false.
    isDeleted: 1,

    version: customer.version + 1,

    syncStatus: SYNC_STATUS.PENDING,

    updatedAt: now(),
  };

  await db.transaction("rw", store(), db.queue, async () => {
    await store().put(deletedCustomer);

    await queue.enqueue({
      module: customerConfig.module,

      operation: OPERATIONS.DELETE,

      localId,

      payload: deletedCustomer,
    });
  });

  return deletedCustomer;
};