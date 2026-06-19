// SUPPLIER SERVICE — all business logic & DB queries

import Supplier from "../models/Supplier.js";

// CREATE
export const createSupplierService = async (data) => {
  const { supplierName, contact, company, email, address } = data;

  const existing = await Supplier.findOne({ where: { contact } });

  if (existing) {
    const error = new Error("Supplier with this contact already exists");
    error.statusCode = 400;
    throw error;
  }

  const supplier = await Supplier.create({
    supplierName,
    contact,
    company,
    email,
    address,
    status: "Y",
  });

  return supplier;
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
  const { supplierName, contact, company, email, address } = data;

  const supplier = await Supplier.findByPk(id);

  if (!supplier) {
    const error = new Error("Supplier not found");
    error.statusCode = 404;
    throw error;
  }

  await supplier.update({
    supplierName,
    contact,
    company,
    email,
    address,
  });

  return supplier;
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