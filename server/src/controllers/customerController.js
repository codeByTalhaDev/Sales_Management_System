// CUSTOMER CONTROLLER — only HTTP handling

import {
  createCustomerService,
  getCustomersService,
  updateCustomerService,
  deleteCustomerService,
} from "../services/customerService.js";

// CREATE
export const createCustomer = async (req, res, next) => {
  try {
    const customer = await createCustomerService(req.body);
    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL
export const getCustomers = async (req, res, next) => {
  try {
    const customers = await getCustomersService();
    res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await updateCustomerService(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    // VERSION CONFLICT — respond 409 with the current server record so
    // the offline client can run its conflict resolution strategy
    // instead of treating this as a generic failure.
    if (error.isConflict) {
      return res.status(409).json({
        success: false,
        conflict: true,
        message: "Version conflict",
        customer: error.serverRecord,
      });
    }

    next(error);
  }
};

// DELETE
export const deleteCustomer = async (req, res, next) => {
  try {
    await deleteCustomerService(req.params.id);
    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};