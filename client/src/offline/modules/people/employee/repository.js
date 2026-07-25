import db from "../../../core/database";
import * as queue from "../../../core/queue";

import employeeConfig from "./config";

import { generateOfflineId } from "../../../utils/generateOfflineId";
import { now } from "../../../utils/timestamp";

import { OPERATIONS, SYNC_STATUS } from "../../../constants/syncStatus";

// NOTE: this is deliberately a function, not a top-level constant.
// See the identical note in customer/repository.js — database.js
// circularly imports back to this file via config/modules.js, so
// db.table(...) must be deferred until it's actually called, not run
// at import time.
const store = () => db.table(employeeConfig.store);

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
    throw new Error(`Employee with this ${list} already exists`);
  }
};

/**
 * Create Employee
 */
export const create = async (employee) => {
  await checkDuplicateFields(employee);

  const timestamp = now();

  const employeeRecord = {
    id: null,

    offlineId: generateOfflineId(),

    employeeName: employee.employeeName,

    contact: employee.contact,

    email: employee.email ?? null,

    designation: employee.designation ?? null,

    salary: employee.salary ?? null,

    joiningDate: employee.joiningDate ?? null,

    status: employee.status ?? "Y",

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
    localId = await store().add(employeeRecord);

    await queue.enqueue({
      module: employeeConfig.module,

      operation: OPERATIONS.CREATE,

      localId,

      payload: {
        ...employeeRecord,
        localId,
      },
    });
  });

  return await store().get(localId);
};

/**
 * Get All Employees
 */
export const getAll = async () => {
  try {
    return await store().where("isDeleted").equals(0).toArray();
  } catch (error) {
    console.error("getAll() failed:", error);

    console.log("Schema:", employeeConfig.schema);
    console.log("Store:", store().name);

    throw error;
  }
};

/**
 * Get Employee By Local Id
 */
export const getByLocalId = async (localId) => {
  return await store().get(localId);
};

/**
 * Get Employee By Server Id
 */
export const getByServerId = async (id) => {
  return await store().where("id").equals(id).first();
};

/**
 * Get Employee By Offline Id
 */
export const getByOfflineId = async (offlineId) => {
  return await store().where("offlineId").equals(offlineId).first();
};

/**
 * Update Employee
 */
export const update = async (localId, updates) => {
  const employee = await store().get(localId);

  if (!employee) {
    throw new Error("Employee not found.");
  }

  await checkDuplicateFields(updates, localId);

  const updatedEmployee = {
    ...employee,

    ...updates,

    version: employee.version + 1,

    syncStatus: SYNC_STATUS.PENDING,

    updatedAt: now(),
  };

  await db.transaction("rw", store(), db.queue, async () => {
    await store().put(updatedEmployee);

    await queue.enqueue({
      module: employeeConfig.module,

      operation: OPERATIONS.UPDATE,

      localId,

      payload: updatedEmployee,
    });
  });

  return await store().get(localId);
};

/**
 * Soft Delete Employee
 */
export const remove = async (localId) => {
  const employee = await store().get(localId);

  if (!employee) {
    throw new Error("Employee not found.");
  }

  const deletedEmployee = {
    ...employee,

    // IndexedDB does not support boolean values as index keys,
    // so isDeleted is stored as 0 (false) / 1 (true) instead of true/false.
    isDeleted: 1,

    version: employee.version + 1,

    syncStatus: SYNC_STATUS.PENDING,

    updatedAt: now(),
  };

  await db.transaction("rw", store(), db.queue, async () => {
    await store().put(deletedEmployee);

    await queue.enqueue({
      module: employeeConfig.module,

      operation: OPERATIONS.DELETE,

      localId,

      payload: deletedEmployee,
    });
  });

  return deletedEmployee;
};