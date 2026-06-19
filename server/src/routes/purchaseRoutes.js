import express from "express";
import {
  createPurchase,
  getPurchases,
  getPurchaseById,
  deletePurchase,
} from "../controllers/purchaseController.js";
import { validateCreatePurchase } from "../validators/purchaseValidator.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",      verifyToken, validateCreatePurchase, createPurchase);
router.get("/",       verifyToken, getPurchases);
router.get("/:id",    verifyToken, getPurchaseById);
router.delete("/:id", verifyToken, deletePurchase);

export default router;