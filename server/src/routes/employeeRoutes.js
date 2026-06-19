import express from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import {
  validateCreateEmployee,
  validateUpdateEmployee,
} from "../validators/employeeValidator.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",      verifyToken, validateCreateEmployee, createEmployee);
router.get("/",       verifyToken, getEmployees);
router.put("/:id",    verifyToken, validateUpdateEmployee, updateEmployee);
router.delete("/:id", verifyToken, deleteEmployee);

export default router;