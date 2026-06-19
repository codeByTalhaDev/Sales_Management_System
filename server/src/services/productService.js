// PRODUCT SERVICE — all business logic & DB queries

import Product from "../models/Product.js";
import Category from "../models/Category.js";
import UOM from "../models/UOM.js";

// BARCODE GENERATOR
const generateBarcode = () => `BAR-${Date.now()}`;

// HELPER — parse boolean from string or bool
const parseBool = (value) => value === "true" || value === true;

// HELPER — build product fields (shared by create & update)
const buildProductFields = (data, existingBarcode = null) => {
  const {
    productName,
    barcode,
    autoGenerateBarcode,
    categoryId,
    uomId,
    purchasePrice,
    salePrice,
    manageInventory,
    quantity,
    reorderQuantity,
    hasExpiryDate,
    expiryDate,
    description,
  } = data;

  const isAutoBarcode   = parseBool(autoGenerateBarcode);
  const isManageInv     = parseBool(manageInventory);
  const isHasExpiry     = parseBool(hasExpiryDate);

  const finalBarcode = isAutoBarcode
    ? existingBarcode || generateBarcode()
    : barcode || null;

  return {
    productName,
    barcode: finalBarcode,
    autoGenerateBarcode: isAutoBarcode,
    categoryId,
    uomId,
    purchasePrice:   purchasePrice   || 0,
    salePrice:       salePrice       || 0,
    manageInventory: isManageInv,
    quantity:        isManageInv ? quantity      || 0 : 0,
    reorderQuantity: isManageInv ? reorderQuantity || 0 : 0,
    hasExpiryDate:   isHasExpiry,
    expiryDate:      isHasExpiry ? expiryDate || null : null,
    description,
  };
};

// CREATE
export const createProductService = async (data, userId) => {
  const fields = buildProductFields(data);

  const product = await Product.create({
    ...fields,
    createdBy: userId,
  });

  return product;
};

// GET ALL ACTIVE
export const getProductsService = async () => {
  const products = await Product.findAll({
    where: { status: "Y" },
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "categoryName", "categoryCode"],
      },
      {
        model: UOM,
        as: "uom",
        attributes: ["id", "uomName", "shortCode"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return products;
};

// UPDATE
export const updateProductService = async (id, data, userId) => {
  const product = await Product.findByPk(id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const fields = buildProductFields(data, product.barcode);

  await product.update({
    ...fields,
    updatedBy: userId,
  });

  return product;
};

// SOFT DELETE
export const deleteProductService = async (id, userId) => {
  const product = await Product.findByPk(id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  await product.update({
    status: "N",
    updatedBy: userId,
  });
};