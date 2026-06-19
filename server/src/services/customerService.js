// CUSTOMER SERVICE — all business logic & DB queries

import Customer from "../models/Customer.js";

// CREATE
export const createCustomerService = async (data) => {
  const { customerName, contact, cnic, email, address } = data;

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

  await customer.update(data);
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