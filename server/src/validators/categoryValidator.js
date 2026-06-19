// CATEGORY VALIDATORS

export const validateCreateCategory = (req, res, next) => {
  const { categoryName, categoryCode } = req.body;

  if (!categoryName || !categoryCode) {
    return res.status(400).json({
      message: "Category Name and Code are required",
    });
  }

  next();
};

export const validateUpdateCategory = (req, res, next) => {
  const { categoryName, categoryCode } = req.body;

  if (!categoryName || !categoryCode) {
    return res.status(400).json({
      message: "Category Name and Code are required",
    });
  }

  next();
};