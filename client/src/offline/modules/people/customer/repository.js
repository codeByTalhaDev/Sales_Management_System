import db from "../../../core/database";
import * as queue from "../../../core/queue";

import customerConfig from "./config";

import { generateOfflineId } from "../../../utils/generateOfflineId";
import { now } from "../../../utils/timestamp";

import { OPERATIONS, SYNC_STATUS } from "../../../constants/syncStatus";

const store = db.table(customerConfig.store);

/**
 * Create Customer
 */
export const create = async (customer) => {
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

  await db.transaction("rw", store, db.queue, async () => {
    localId = await store.add(customerRecord);

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

  return await store.get(localId);
};

/**
 * Get All Customers
 */
export const getAll = async () => {
  try {
    return await store.where("isDeleted").equals(0).toArray();
  } catch (error) {
    console.error("getAll() failed:", error);

    console.log("Schema:", customerConfig.schema);
    console.log("Store:", store.name);

    throw error;
  }
};

/**
 * Get Customer By Local Id
 */
export const getByLocalId = async (localId) => {
  return await store.get(localId);
};

/**
 * Get Customer By Server Id
 */
export const getByServerId = async (id) => {
  return await store.where("id").equals(id).first();
};

/**
 * Get Customer By Offline Id
 */
export const getByOfflineId = async (offlineId) => {
  return await store.where("offlineId").equals(offlineId).first();
};

/**
 * Update Customer
 */
export const update = async (localId, updates) => {
  const customer = await store.get(localId);

  if (!customer) {
    throw new Error("Customer not found.");
  }

  const updatedCustomer = {
    ...customer,

    ...updates,

    version: customer.version + 1,

    syncStatus: SYNC_STATUS.PENDING,

    updatedAt: now(),
  };

  await db.transaction("rw", store, db.queue, async () => {
    await store.put(updatedCustomer);

    await queue.enqueue({
      module: customerConfig.module,

      operation: OPERATIONS.UPDATE,

      localId,

      payload: updatedCustomer,
    });
  });

  return await store.get(localId);
};

/**
 * Soft Delete Customer
 */
export const remove = async (localId) => {
  const customer = await store.get(localId);

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

  await db.transaction("rw", store, db.queue, async () => {
    await store.put(deletedCustomer);

    await queue.enqueue({
      module: customerConfig.module,

      operation: OPERATIONS.DELETE,

      localId,

      payload: deletedCustomer,
    });
  });

  return deletedCustomer;
};