// UOM SERVICE — all business logic & DB queries

import UOM from "../models/UOM.js";

// CREATE
export const createUOMService = async (data, userId) => {
  const { uomName, shortCode, description } = data;

  const exists = await UOM.findOne({ where: { shortCode } });

  if (exists) {
    // IF SOFT DELETED — RESTORE IT
    if (exists.status === "N") {
      await exists.update({
        uomName,
        description,
        status: "Y",
        updatedBy: userId,
      });

      return { restored: true, uom: exists };
    }

    const error = new Error("Short Code already exists");
    error.statusCode = 400;
    throw error;
  }

  const uom = await UOM.create({
    uomName,
    shortCode,
    description,
    createdBy: userId,
  });

  return { restored: false, uom };
};

// GET ALL ACTIVE
export const getUOMSService = async () => {
  const uoms = await UOM.findAll({
    where: { status: "Y" },
    order: [["createdAt", "DESC"]],
  });

  return uoms;
};

// UPDATE
export const updateUOMService = async (id, data, userId) => {
  const { uomName, shortCode, description } = data;

  const uom = await UOM.findByPk(id);

  if (!uom) {
    const error = new Error("UOM not found");
    error.statusCode = 404;
    throw error;
  }

  await uom.update({
    uomName,
    shortCode,
    description,
    updatedBy: userId,
  });

  return uom;
};

// SOFT DELETE
export const deleteUOMService = async (id, userId) => {
  const uom = await UOM.findByPk(id);

  if (!uom) {
    const error = new Error("UOM not found");
    error.statusCode = 404;
    throw error;
  }

  await uom.update({
    status: "N",
    updatedBy: userId,
  });
};