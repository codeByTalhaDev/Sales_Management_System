// SUPPLIER VALIDATORS

export const validateCreateSupplier = (req, res, next) => {
  const { supplierName, contact } = req.body;

  if (!supplierName || !contact) {
    return res.status(400).json({
      success: false,
      message: "Supplier name and contact are required",
    });
  }

  next();
};

export const validateUpdateSupplier = (req, res, next) => {
  const { supplierName, contact } = req.body;

  if (!supplierName || !contact) {
    return res.status(400).json({
      success: false,
      message: "Supplier name and contact are required",
    });
  }

  next();
};