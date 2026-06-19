// PURCHASE CONTROLLER — only HTTP handling

import {
  createPurchaseService,
  getPurchasesService,
  getPurchaseByIdService,
  deletePurchaseService,
} from "../services/purchaseService.js";

// CREATE
export const createPurchase = async (req, res, next) => {
  try {
    const purchase = await createPurchaseService(req.body, req.user?.id);
    res.status(201).json({
      message: "Purchase created successfully",
      purchase,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL
export const getPurchases = async (req, res, next) => {
  try {
    const purchases = await getPurchasesService();
    res.json({ purchases });
  } catch (error) {
    next(error);
  }
};

// GET BY ID
export const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await getPurchaseByIdService(req.params.id);
    res.json({ purchase });
  } catch (error) {
    next(error);
  }
};

// DELETE
export const deletePurchase = async (req, res, next) => {
  try {
    await deletePurchaseService(req.params.id, req.user?.id);
    res.json({ message: "Purchase deleted successfully" });
  } catch (error) {
    next(error);
  }
};