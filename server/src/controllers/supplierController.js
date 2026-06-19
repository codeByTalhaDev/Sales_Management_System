// SUPPLIER CONTROLLER — only HTTP handling

import {
  createSupplierService,
  getSuppliersService,
  updateSupplierService,
  deleteSupplierService,
} from "../services/supplierService.js";

// CREATE
export const createSupplier = async (req, res, next) => {
  try {
    const supplier = await createSupplierService(req.body);
    res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      supplier,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL
export const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await getSuppliersService();
    res.status(200).json({
      success: true,
      suppliers,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await updateSupplierService(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE
export const deleteSupplier = async (req, res, next) => {
  try {
    await deleteSupplierService(req.params.id);
    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};