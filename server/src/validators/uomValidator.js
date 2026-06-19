// UOM VALIDATORS

export const validateCreateUOM = (req, res, next) => {
  const { uomName, shortCode } = req.body;

  if (!uomName || !shortCode) {
    return res.status(400).json({
      message: "UOM Name and Short Code are required",
    });
  }

  next();
};

export const validateUpdateUOM = (req, res, next) => {
  const { uomName, shortCode } = req.body;

  if (!uomName || !shortCode) {
    return res.status(400).json({
      message: "UOM Name and Short Code are required",
    });
  }

  next();
};