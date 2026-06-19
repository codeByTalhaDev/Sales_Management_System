// CUSTOMER VALIDATORS

export const validateCreateCustomer = (req, res, next) => {
  const { customerName, contact } = req.body;

  if (!customerName || !contact) {
    return res.status(400).json({
      success: false,
      message: "Customer name and contact are required",
    });
  }

  next();
};

export const validateUpdateCustomer = (req, res, next) => {
  const { customerName, contact } = req.body;

  if (!customerName || !contact) {
    return res.status(400).json({
      success: false,
      message: "Customer name and contact are required",
    });
  }

  next();
};