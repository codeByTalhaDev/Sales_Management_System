import express from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import {
  validateCreateCategory,
  validateUpdateCategory,
} from "../validators/categoryValidator.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",    verifyToken, validateCreateCategory, createCategory);
router.get("/",     verifyToken, getCategories);
router.put("/:id",  verifyToken, validateUpdateCategory, updateCategory);
router.delete("/:id", verifyToken, deleteCategory);

export default router;