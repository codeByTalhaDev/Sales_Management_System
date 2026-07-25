import { DataTypes } from "sequelize";

import sequelize from "../config/db.js";

const Supplier = sequelize.define(
  "Supplier",
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

    supplierName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // NOTE: contact/email are intentionally NOT unique at the database
    // level. This table uses soft delete (status: "N"), and a hard DB
    // unique constraint has no concept of "deleted" — it would block a
    // value forever even after the row is soft-deleted. Uniqueness
    // among ACTIVE suppliers is instead enforced in supplierService.js,
    // which only checks status: "Y" rows (same fix already applied to
    // the Customer module after hitting exactly this issue there).
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    company: {
      type: DataTypes.STRING,
    },

    email: {
      type: DataTypes.STRING,
    },

    address: {
      type: DataTypes.TEXT,
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

export default Supplier;