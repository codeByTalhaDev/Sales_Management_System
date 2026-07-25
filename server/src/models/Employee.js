import { DataTypes } from "sequelize";

import sequelize from "../config/db.js";

const Employee = sequelize.define(
  "Employee",
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

    employeeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // NOTE: contact/email are intentionally NOT unique at the database
    // level. This table uses soft delete (status: "N"), and a hard DB
    // unique constraint has no concept of "deleted" — it would block a
    // value forever even after the row is soft-deleted. Uniqueness
    // among ACTIVE employees is instead enforced in employeeService.js,
    // which only checks status: "Y" rows (same fix already applied to
    // Customer and Supplier).
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
    },

    designation: {
      type: DataTypes.STRING,
    },

    salary: {
      type: DataTypes.FLOAT,
    },

    joiningDate: {
      type: DataTypes.DATEONLY,
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

export default Employee;