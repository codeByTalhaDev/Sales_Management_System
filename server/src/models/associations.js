import Product from "./Product.js";
import Category from "./Category.js";
import UOM from "./UOM.js";
import Supplier from "./Supplier.js";
import Purchase from "./Purchase.js";
import PurchaseItem from "./PurchaseItem.js";

// CATEGORY → PRODUCT
Category.hasMany(Product, {
  foreignKey: "categoryId",
  as: "products",
});

Product.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

// UOM → PRODUCT
UOM.hasMany(Product, {
  foreignKey: "uomId",
  as: "products",
});

Product.belongsTo(UOM, {
  foreignKey: "uomId",
  as: "uom",
});

// SUPPLIER → PURCHASE
Supplier.hasMany(Purchase, {
  foreignKey: "supplierId",
  as: "purchases",
});

Purchase.belongsTo(Supplier, {
  foreignKey: "supplierId",
  as: "supplier",
});

// PURCHASE → PURCHASE ITEMS
Purchase.hasMany(PurchaseItem, {
  foreignKey: "purchaseId",
  as: "items",
});

PurchaseItem.belongsTo(Purchase, {
  foreignKey: "purchaseId",
  as: "purchase",
});

// PRODUCT → PURCHASE ITEMS
Product.hasMany(PurchaseItem, {
  foreignKey: "productId",
  as: "purchaseItems",
});

PurchaseItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

export {
  Product,
  Category,
  UOM,
  Supplier,
  Purchase,
  PurchaseItem,
};