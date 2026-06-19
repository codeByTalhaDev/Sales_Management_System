// CATEGORY SERVICE — all business logic & DB queries

import Category from "../models/Category.js";

// CREATE
export const createCategoryService = async (data, userId) => {
  const { categoryName, categoryCode, description } = data;

  const exists = await Category.findOne({ where: { categoryCode } });

  if (exists) {
    // IF SOFT DELETED — RESTORE IT
    if (exists.status === "N") {
      await exists.update({
        categoryName,
        description,
        status: "Y",
        updatedBy: userId,
      });

      return { restored: true, category: exists };
    }

    const error = new Error("Category Code already exists");
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.create({
    categoryName,
    categoryCode,
    description,
    createdBy: userId,
  });

  return { restored: false, category };
};

// GET ALL ACTIVE
export const getCategoriesService = async () => {
  const categories = await Category.findAll({
    where: { status: "Y" },
    order: [["createdAt", "DESC"]],
  });

  return categories;
};

// UPDATE
export const updateCategoryService = async (id, data, userId) => {
  const { categoryName, categoryCode, description } = data;

  const category = await Category.findByPk(id);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  await category.update({
    categoryName,
    categoryCode,
    description,
    updatedBy: userId,
  });

  return category;
};

// SOFT DELETE
export const deleteCategoryService = async (id, userId) => {
  const category = await Category.findByPk(id);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  await category.update({
    status: "N",
    updatedBy: userId,
  });
};