// UOM CONTROLLER — only HTTP handling

import {
  createUOMService,
  getUOMSService,
  updateUOMService,
  deleteUOMService,
} from "../services/uomService.js";

// CREATE
export const createUOM = async (req, res, next) => {
  try {
    const result = await createUOMService(req.body, req.user?.id);

    if (result.restored) {
      return res.status(200).json({
        message: "UOM restored successfully",
        uom: result.uom,
      });
    }

    res.status(201).json({
      message: "UOM created successfully",
      uom: result.uom,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL
export const getUOMS = async (req, res, next) => {
  try {
    const uoms = await getUOMSService();
    res.json({ uoms });
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateUOM = async (req, res, next) => {
  try {
    const uom = await updateUOMService(req.params.id, req.body, req.user?.id);
    res.json({
      message: "UOM updated successfully",
      uom,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE
export const deleteUOM = async (req, res, next) => {
  try {
    await deleteUOMService(req.params.id, req.user?.id);
    res.json({ message: "UOM deleted successfully" });
  } catch (error) {
    next(error);
  }
};