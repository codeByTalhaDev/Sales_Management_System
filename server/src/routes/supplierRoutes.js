import express from "express";
import {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";
import {
  validateCreateSupplier,
  validateUpdateSupplier,
} from "../validators/supplierValidator.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",      verifyToken, validateCreateSupplier, createSupplier);
router.get("/",       verifyToken, getSuppliers);
router.put("/:id",    verifyToken, validateUpdateSupplier, updateSupplier);
router.delete("/:id", verifyToken, deleteSupplier);

export default router;