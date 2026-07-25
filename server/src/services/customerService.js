// CUSTOMER SERVICE — all business logic & DB queries

import { Op } from "sequelize";
import sequelize from "../config/db.js";
import Customer from "../models/Customer.js";

const DUPLICATE_FIELD_LABELS = {
  contact: "contact number",
  cnic: "CNIC",
  email: "email",
};

/**
 * Check contact/cnic/email for duplicates among ACTIVE customers only
 * (status: "Y"). Soft-deleted customers (status: "N") are intentionally
 * excluded — once a customer is deleted, their phone number/CNIC/email
 * becomes reusable again, matching how a real business expects deletion
 * to behave. This is why these fields are NOT hard-unique at the DB
 * level (see Customer.js) — a real UNIQUE constraint can't tell an
 * active row from a deleted one.
 *
 * Checks ALL fields before throwing, so if e.g. both contact and email
 * already exist, the response names both at once.
 *
 * Runs inside the same transaction as the create/update it's guarding,
 * which closes most of the race window between two near-simultaneous
 * requests — not an absolute guarantee at very high concurrency, but
 * more than sufficient for this application's real-world scale.
 */
const checkDuplicateFields = async (data, excludeId = null, transaction) => {
  const fieldsToCheck = ["contact", "cnic", "email"];
  const conflicts = [];

  for (const field of fieldsToCheck) {
    const value = data[field];
    if (!value) continue;

    const where = { [field]: value, status: "Y" };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const existing = await Customer.findOne({ where, transaction });

    if (existing) {
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

    const error = new Error(`Customer with this ${list} already exists`);
    error.statusCode = 400;
    throw error;
  }
};

// CREATE
export const createCustomerService = async (data) => {
  const { customerName, contact, cnic, email, address, offlineId } = data;

  // IDEMPOTENCY CHECK
  // If this offlineId was already created (e.g. the offline client's
  // sync request succeeded but the response never reached it, so it
  // retried), return the existing record instead of creating a duplicate.
  if (offlineId) {
    const existingByOfflineId = await Customer.findOne({
      where: { offlineId },
    });

    if (existingByOfflineId) {
      return existingByOfflineId;
    }
  }

  return await sequelize.transaction(async (transaction) => {
    await checkDuplicateFields({ contact, cnic, email }, null, transaction);

    const customer = await Customer.create(
      {
        customerName,
        contact,
        cnic,
        email,
        address,
        status: "Y",
        offlineId: offlineId ?? null,
        version: 1,
      },
      { transaction }
    );

    return customer;
  });
};

// GET ALL ACTIVE
export const getCustomersService = async () => {
  const customers = await Customer.findAll({
    where: { status: "Y" },
    order: [["createdAt", "DESC"]],
  });

  return customers;
};

// UPDATE
export const updateCustomerService = async (id, data) => {
  const customer = await Customer.findByPk(id);

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  const { version: clientVersion, ...updates } = data;

  // VERSION CONFLICT CHECK
  // The offline client sends the version it has *after* applying its
  // local edit (see repository.js: version = current + 1). If the
  // server's stored version is already at or ahead of that, it means
  // another sync already moved this record forward — the client's
  // edit was based on stale data, so reject it as a conflict instead
  // of silently overwriting.
  if (clientVersion !== undefined && customer.version >= clientVersion) {
    const error = new Error("Version conflict");
    error.statusCode = 409;
    error.isConflict = true;
    error.serverRecord = customer;
    throw error;
  }

  return await sequelize.transaction(async (transaction) => {
    await checkDuplicateFields(updates, customer.id, transaction);

    await customer.update(
      {
        ...updates,
        version: clientVersion ?? customer.version + 1,
      },
      { transaction }
    );

    return customer;
  });
};

// SOFT DELETE
export const deleteCustomerService = async (id) => {
  const customer = await Customer.findByPk(id);

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  await customer.update({ status: "N" });
  return true;
};