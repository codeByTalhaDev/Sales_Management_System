// CUSTOMER SERVICE — all business logic & DB queries

import Customer from "../models/Customer.js";

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

  // CHECK DUPLICATE CONTACT
  const existing = await Customer.findOne({ where: { contact } });
  if (existing) {
    const error = new Error("Customer with this contact already exists");
    error.statusCode = 400;
    throw error;
  }

  const customer = await Customer.create({
    customerName,
    contact,
    cnic,
    email,
    address,
    status: "Y",
    offlineId: offlineId ?? null,
    version: 1,
  });

  return customer;
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

  await customer.update({
    ...updates,
    version: clientVersion ?? customer.version + 1,
  });

  return customer;
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