import express from "express";
import {
  createUOM,
  getUOMS,
  updateUOM,
  deleteUOM,
} from "../controllers/uomController.js";
import {
  validateCreateUOM,
  validateUpdateUOM,
} from "../validators/uomValidator.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",      verifyToken, validateCreateUOM, createUOM);
router.get("/",       verifyToken, getUOMS);
router.put("/:id",    verifyToken, validateUpdateUOM, updateUOM);
router.delete("/:id", verifyToken, deleteUOM);

export default router;