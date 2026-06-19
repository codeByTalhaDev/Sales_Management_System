// STOCK CONTROLLER — only HTTP handling

import {
  getStockListService,
  getReorderListService,
  getExpiryListService,
} from "../services/stockService.js";

// STOCK LIST
export const getStockList = async (req, res, next) => {
  try {
    const products = await getStockListService();
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

// REORDER LIST
export const getReorderList = async (req, res, next) => {
  try {
    const products = await getReorderListService();
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

// EXPIRY LIST
export const getExpiryList = async (req, res, next) => {
  try {
    const products = await getExpiryListService();
    res.json({ products });
  } catch (error) {
    next(error);
  }
};