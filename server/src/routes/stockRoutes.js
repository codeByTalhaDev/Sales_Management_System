import express from "express";
import {
  getStockList,
  getReorderList,
  getExpiryList,
} from "../controllers/stockController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",        verifyToken, getStockList);
router.get("/reorder", verifyToken, getReorderList);
router.get("/expiry",  verifyToken, getExpiryList);

export default router;