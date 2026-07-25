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
    // Safe to keep as a hard DB unique constraint — a given offlineId is
    // only ever generated once, and is never reused after a delete.
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

    // NOTE: contact/cnic/email are intentionally NOT unique at the
    // database level. This table uses soft delete (status: "N"), and a
    // hard DB unique constraint has no concept of "deleted" — it blocks
    // a value forever even after the row is soft-deleted, permanently
    // locking out a phone number/CNIC/email a real customer may need to
    // reuse later. Uniqueness among ACTIVE records is instead enforced
    // in customerService.js, which only checks status: "Y" rows.
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