// PRODUCT CONTROLLER — only HTTP handling

import {
  createProductService,
  getProductsService,
  updateProductService,
  deleteProductService,
} from "../services/productService.js";

// CREATE
export const createProduct = async (req, res, next) => {
  try {
    const product = await createProductService(req.body, req.user?.id);
    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL
export const getProducts = async (req, res, next) => {
  try {
    const products = await getProductsService();
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateProduct = async (req, res, next) => {
  try {
    const product = await updateProductService(req.params.id, req.body, req.user?.id);
    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE
export const deleteProduct = async (req, res, next) => {
  try {
    await deleteProductService(req.params.id, req.user?.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};