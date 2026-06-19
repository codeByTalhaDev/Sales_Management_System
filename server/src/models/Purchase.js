import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Purchase = sequelize.define(
  "Purchase",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    purchaseNo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    purchaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    remainingBalance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    notes: {
      type: DataTypes.TEXT,
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
  }
);

export default Purchase;