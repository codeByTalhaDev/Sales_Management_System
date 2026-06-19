// DASHBOARD SERVICE — all business logic & DB queries

import { Op } from "sequelize";
import Customer from "../models/Customer.js";
import Supplier from "../models/Supplier.js";
import Employee from "../models/Employee.js";
import Product from "../models/Product.js";

export const getDashboardStatsService = async () => {
  // RUN ALL COUNTS IN PARALLEL — faster than sequential await
  const [
    customers,
    suppliers,
    employees,
    products,
    lowStock,
    expiryProducts,
  ] = await Promise.all([
    Customer.count({ where: { status: "Y" } }),

    Supplier.count({ where: { status: "Y" } }),

    Employee.count({ where: { status: "Y" } }),

    Product.count({ where: { status: "Y" } }),

    Product.count({
      where: {
        status: "Y",
        manageInventory: true,
        quantity: {
          [Op.lte]: Product.sequelize.col("reorderQuantity"),
        },
      },
    }),

    Product.count({
      where: {
        status: "Y",
        hasExpiryDate: true,
        expiryDate: { [Op.ne]: null },
      },
    }),
  ]);

  return {
    customers,
    suppliers,
    employees,
    products,
    lowStock,
    expiryProducts,
  };
};