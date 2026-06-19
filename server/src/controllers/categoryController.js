// CATEGORY CONTROLLER — only HTTP handling

import {
  createCategoryService,
  getCategoriesService,
  updateCategoryService,
  deleteCategoryService,
} from "../services/categoryService.js";

// CREATE
export const createCategory = async (req, res, next) => {
  try {
    const result = await createCategoryService(req.body, req.user?.id);

    if (result.restored) {
      return res.status(200).json({
        message: "Category restored successfully",
        category: result.category,
      });
    }

    res.status(201).json({
      message: "Category created successfully",
      category: result.category,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL
export const getCategories = async (req, res, next) => {
  try {
    const categories = await getCategoriesService();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateCategory = async (req, res, next) => {
  try {
    const category = await updateCategoryService(req.params.id, req.body, req.user?.id);
    res.json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE
export const deleteCategory = async (req, res, next) => {
  try {
    await deleteCategoryService(req.params.id, req.user?.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};