// STOCK SERVICE — all business logic & DB queries

import Product from "../models/Product.js";
import Category from "../models/Category.js";
import UOM from "../models/UOM.js";
import { Op } from "sequelize";

// SHARED INCLUDE — category & uom attributes used in all 3 queries
const categoryUomInclude = [
  {
    model: Category,
    as: "category",
    attributes: ["id", "categoryName"],
  },
  {
    model: UOM,
    as: "uom",
    attributes: ["id", "shortCode"],
  },
];

// STOCK LIST — all active inventory-managed products
export const getStockListService = async () => {
  const products = await Product.findAll({
    where: {
      status: "Y",
      manageInventory: true,
    },
    include: categoryUomInclude,
    order: [["createdAt", "DESC"]],
  });

  return products;
};

// REORDER LIST — products at or below reorder quantity
export const getReorderListService = async () => {
  const products = await Product.findAll({
    where: {
      status: "Y",
      manageInventory: true,
      quantity: {
        [Op.lte]: Product.sequelize.col("reorderQuantity"),
      },
    },
    include: categoryUomInclude,
    order: [["quantity", "ASC"]],
  });

  return products;
};

// EXPIRY LIST — products with expiry date set, ordered soonest first
export const getExpiryListService = async () => {
  const products = await Product.findAll({
    where: {
      status: "Y",
      hasExpiryDate: true,
      expiryDate: {
        [Op.ne]: null,
      },
    },
    include: categoryUomInclude,
    order: [["expiryDate", "ASC"]],
  });

  return products;
};