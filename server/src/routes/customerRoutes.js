import express from "express";
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";
import {
  validateCreateCustomer,
  validateUpdateCustomer,
} from "../validators/customerValidator.js";

const router = express.Router();

router.post("/",    validateCreateCustomer, createCustomer);
router.get("/",     getCustomers);
router.put("/:id",  validateUpdateCustomer, updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;