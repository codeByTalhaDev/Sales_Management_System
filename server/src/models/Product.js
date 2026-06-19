import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    autoGenerateBarcode: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    uomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    salePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    manageInventory: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    reorderQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    hasExpiryDate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("Y", "N"),
      defaultValue: "Y",
    },

    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  },
);

export default Product;
