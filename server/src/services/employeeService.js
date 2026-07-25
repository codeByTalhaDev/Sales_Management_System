// EMPLOYEE SERVICE — all business logic & DB queries

import { Op } from "sequelize";
import sequelize from "../config/db.js";
import Employee from "../models/Employee.js";

const DUPLICATE_FIELD_LABELS = {
  contact: "contact number",
  email: "email",
};

/**
 * Check contact/email for duplicates among ACTIVE employees only
 * (status: "Y"). Soft-deleted employees (status: "N") are excluded —
 * once an employee is deleted, their contact/email becomes reusable
 * again. This is why these fields are NOT hard-unique at the DB level
 * (see Employee.js) — same reasoning as the Customer and Supplier
 * modules.
 *
 * Checks both fields before throwing, so a conflict on both is
 * reported together instead of one at a time.
 *
 * Runs inside the same transaction as the create/update it guards,
 * closing most of the race window between two near-simultaneous
 * requests.
 */
const checkDuplicateFields = async (data, excludeId = null, transaction) => {
  const fieldsToCheck = ["contact", "email"];
  const conflicts = [];

  for (const field of fieldsToCheck) {
    const value = data[field];
    if (!value) continue;

    const where = { [field]: value, status: "Y" };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const existing = await Employee.findOne({ where, transaction });

    if (existing) {
      conflicts.push(DUPLICATE_FIELD_LABELS[field]);
    }
  }

  if (conflicts.length > 0) {
    const list = conflicts.join(" and ");
    const error = new Error(`Employee with this ${list} already exists`);
    error.statusCode = 400;
    throw error;
  }
};

// CREATE
export const createEmployeeService = async (data) => {
  const {
    employeeName,
    contact,
    email,
    designation,
    salary,
    joiningDate,
    offlineId,
  } = data;

  // IDEMPOTENCY CHECK
  // If this offlineId was already created (e.g. the offline client's
  // sync request succeeded but the response never reached it, so it
  // retried), return the existing record instead of creating a duplicate.
  if (offlineId) {
    const existingByOfflineId = await Employee.findOne({
      where: { offlineId },
    });

    if (existingByOfflineId) {
      return existingByOfflineId;
    }
  }

  return await sequelize.transaction(async (transaction) => {
    await checkDuplicateFields({ contact, email }, null, transaction);

    const employee = await Employee.create(
      {
        employeeName,
        contact,
        email,
        designation,
        salary,
        joiningDate,
        status: "Y",
        offlineId: offlineId ?? null,
        version: 1,
      },
      { transaction }
    );

    return employee;
  });
};

// GET ALL ACTIVE
export const getEmployeesService = async () => {
  const employees = await Employee.findAll({
    where: { status: "Y" },
    order: [["createdAt", "DESC"]],
  });

  return employees;
};

// UPDATE
export const updateEmployeeService = async (id, data) => {
  const employee = await Employee.findByPk(id);

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  const { version: clientVersion, ...updates } = data;

  // VERSION CONFLICT CHECK
  // The offline client sends the version it has *after* applying its
  // local edit. If the server's stored version is already at or ahead
  // of that, another sync already moved this record forward — the
  // client's edit was based on stale data, so reject it as a conflict
  // instead of silently overwriting.
  if (clientVersion !== undefined && employee.version >= clientVersion) {
    const error = new Error("Version conflict");
    error.statusCode = 409;
    error.isConflict = true;
    error.serverRecord = employee;
    throw error;
  }

  return await sequelize.transaction(async (transaction) => {
    await checkDuplicateFields(updates, employee.id, transaction);

    await employee.update(
      {
        ...updates,
        version: clientVersion ?? employee.version + 1,
      },
      { transaction }
    );

    return employee;
  });
};

// SOFT DELETE
export const deleteEmployeeService = async (id) => {
  const employee = await Employee.findByPk(id);

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  await employee.update({ status: "N" });
};