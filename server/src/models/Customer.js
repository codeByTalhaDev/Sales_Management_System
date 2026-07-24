import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // Identifies the record that created this row on the offline client,
    // so a retried CREATE sync (e.g. after a dropped response) can be
    // detected as "already created" instead of producing a duplicate row.
    offlineId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    // Optimistic concurrency counter. Incremented on every update so the
    // server can detect when an offline client is updating from a stale
    // base and reject it as a conflict instead of silently overwriting.
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    cnic: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("Y", "N"),
      defaultValue: "Y",
    },
  },
  {
    timestamps: true,
  }
);

export default Customer;