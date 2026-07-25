// SUPPLIER SERVICE — all business logic & DB queries

import { Op } from "sequelize";
import sequelize from "../config/db.js";
import Supplier from "../models/Supplier.js";

const DUPLICATE_FIELD_LABELS = {
  contact: "contact number",
  email: "email",
};

/**
 * Check contact/email for duplicates among ACTIVE suppliers only
 * (status: "Y"). Soft-deleted suppliers (status: "N") are excluded —
 * once a supplier is deleted, their contact/email becomes reusable
 * again. This is why these fields are NOT hard-unique at the DB level
 * (see Supplier.js) — same reasoning as the Customer module.
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

    const existing = await Supplier.findOne({ where, transaction });

    if (existing) {
      conflicts.push(DUPLICATE_FIELD_LABELS[field]);
    }
  }

  if (conflicts.length > 0) {
    const list = conflicts.join(" and ");
    const error = new Error(`Supplier with this ${list} already exists`);
    error.statusCode = 400;
    throw error;
  }
};

// CREATE
export const createSupplierService = async (data) => {
  const { supplierName, contact, company, email, address, offlineId } = data;

  // IDEMPOTENCY CHECK
  // If this offlineId was already created (e.g. the offline client's
  // sync request succeeded but the response never reached it, so it
  // retried), return the existing record instead of creating a duplicate.
  if (offlineId) {
    const existingByOfflineId = await Supplier.findOne({
      where: { offlineId },
    });

    if (existingByOfflineId) {
      return existingByOfflineId;
    }
  }

  return await sequelize.transaction(async (transaction) => {
    await checkDuplicateFields({ contact, email }, null, transaction);

    const supplier = await Supplier.create(
      {
        supplierName,
        contact,
        company,
        email,
        address,
        status: "Y",
        offlineId: offlineId ?? null,
        version: 1,
      },
      { transaction }
    );

    return supplier;
  });
};

// GET ALL ACTIVE
export const getSuppliersService = async () => {
  const suppliers = await Supplier.findAll({
    where: { status: "Y" },
    order: [["createdAt", "DESC"]],
  });

  return suppliers;
};

// UPDATE
export const updateSupplierService = async (id, data) => {
  const supplier = await Supplier.findByPk(id);

  if (!supplier) {
    const error = new Error("Supplier not found");
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
  if (clientVersion !== undefined && supplier.version >= clientVersion) {
    const error = new Error("Version conflict");
    error.statusCode = 409;
    error.isConflict = true;
    error.serverRecord = supplier;
    throw error;
  }

  return await sequelize.transaction(async (transaction) => {
    await checkDuplicateFields(updates, supplier.id, transaction);

    await supplier.update(
      {
        ...updates,
        version: clientVersion ?? supplier.version + 1,
      },
      { transaction }
    );

    return supplier;
  });
};

// SOFT DELETE
export const deleteSupplierService = async (id) => {
  const supplier = await Supplier.findByPk(id);

  if (!supplier) {
    const error = new Error("Supplier not found");
    error.statusCode = 404;
    throw error;
  }

  await supplier.update({ status: "N" });
};