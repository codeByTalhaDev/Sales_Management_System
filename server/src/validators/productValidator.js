// PRODUCT VALIDATORS

export const validateCreateProduct = (req, res, next) => {
  const { productName, categoryId, uomId } = req.body;

  if (!productName || !categoryId || !uomId) {
    return res.status(400).json({
      message: "Product name, Category and UOM are required",
    });
  }

  next();
};

export const validateUpdateProduct = (req, res, next) => {
  const { productName, categoryId, uomId } = req.body;

  if (!productName || !categoryId || !uomId) {
    return res.status(400).json({
      message: "Product name, Category and UOM are required",
    });
  }

  next();
};