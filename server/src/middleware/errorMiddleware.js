// CENTRAL ERROR HANDLER

// 404 — ROUTE NOT FOUND
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// GLOBAL ERROR HANDLER
export const errorHandler = (err, req, res, next) => {
  // SEQUELIZE VALIDATION ERROR
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: err.errors.map((e) => e.message).join(", "),
    });
  }

  // SEQUELIZE UNIQUE CONSTRAINT ERROR
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      success: false,
      message: err.errors.map((e) => e.message).join(", "),
    });
  }

  // JWT ERRORS
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // DEFAULT ERROR
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
};