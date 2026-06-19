// EMPLOYEE VALIDATORS

export const validateCreateEmployee = (req, res, next) => {
  const { employeeName, contact } = req.body;

  if (!employeeName || !contact) {
    return res.status(400).json({
      success: false,
      message: "Employee name and contact are required",
    });
  }

  next();
};

export const validateUpdateEmployee = (req, res, next) => {
  const { employeeName, contact } = req.body;

  if (!employeeName || !contact) {
    return res.status(400).json({
      success: false,
      message: "Employee name and contact are required",
    });
  }

  next();
};