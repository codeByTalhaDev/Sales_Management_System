// PURCHASE SERVICE — all business logic & DB queries

import sequelize from "../config/db.js";
import Purchase from "../models/Purchase.js";
import PurchaseItem from "../models/PurchaseItem.js";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";

// PURCHASE NUMBER GENERATOR
const generatePurchaseNo = () => `PUR-${Date.now()}`;

// CREATE
export const createPurchaseService = async (data, userId) => {
  const { supplierId, purchaseDate, notes, paidAmount, items } = data;

  // CALCULATE TOTAL
  const totalAmount = items.reduce((sum, item) => {
    return sum + Number(item.quantity) * Number(item.purchasePrice);
  }, 0);

  const finalPaidAmount    = Number(paidAmount || 0);
  const remainingBalance   = totalAmount - finalPaidAmount;

  if (finalPaidAmount > totalAmount) {
    const error = new Error("Paid amount cannot be greater than total amount");
    error.statusCode = 400;
    throw error;
  }

  const transaction = await sequelize.transaction();

  try {
    // CREATE PURCHASE HEADER
    const purchase = await Purchase.create(
      {
        purchaseNo: generatePurchaseNo(),
        supplierId,
        purchaseDate,
        totalAmount,
        paidAmount: finalPaidAmount,
        remainingBalance,
        notes,
        createdBy: userId,
      },
      { transaction }
    );

    // CREATE ITEMS + UPDATE STOCK
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });

      if (!product) {
        await transaction.rollback();
        const error = new Error(`Product not found: ${item.productId}`);
        error.statusCode = 404;
        throw error;
      }

      await PurchaseItem.create(
        {
          purchaseId:    purchase.id,
          productId:     item.productId,
          quantity:      item.quantity,
          purchasePrice: item.purchasePrice,
          total:         Number(item.quantity) * Number(item.purchasePrice),
        },
        { transaction }
      );

      // UPDATE PRODUCT STOCK
      await product.update(
        { quantity: Number(product.quantity || 0) + Number(item.quantity) },
        { transaction }
      );
    }

    await transaction.commit();
    return purchase;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// GET ALL ACTIVE
export const getPurchasesService = async () => {
  const purchases = await Purchase.findAll({
    where: { status: "Y" },
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["id", "supplierName", "company"],
      },
      {
        model: PurchaseItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "productName", "barcode"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return purchases;
};

// GET BY ID
export const getPurchaseByIdService = async (id) => {
  const purchase = await Purchase.findOne({
    where: { id, status: "Y" },
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["id", "supplierName", "company", "contact"],
      },
      {
        model: PurchaseItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "productName", "barcode"],
          },
        ],
      },
    ],
  });

  if (!purchase) {
    const error = new Error("Purchase not found");
    error.statusCode = 404;
    throw error;
  }

  return purchase;
};

// SOFT DELETE
export const deletePurchaseService = async (id, userId) => {
  const purchase = await Purchase.findByPk(id);

  if (!purchase) {
    const error = new Error("Purchase not found");
    error.statusCode = 404;
    throw error;
  }

  await purchase.update({
    status: "N",
    updatedBy: userId,
  });
};