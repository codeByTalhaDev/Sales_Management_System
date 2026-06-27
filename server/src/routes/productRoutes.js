import express from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import {
  validateCreateProduct,
  validateUpdateProduct,
} from "../validators/productValidator.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/",      verifyToken, upload.single("image"), validateCreateProduct, createProduct);
router.get("/",       verifyToken, getProducts);
router.put("/:id",    verifyToken, upload.single("image"), validateUpdateProduct, updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;