// 404 - Route Not Found
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Global Error Handler
export const errorHandler = (err, req, res, next) => {
  // Print the actual error in the terminal
  console.error("ERROR:", err);

  // Sequelize Validation Error
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: err.errors.map((e) => e.message).join(", "),
    });
  }

  // Sequelize Unique Constraint Error
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      success: false,
      message: err.errors.map((e) => e.message).join(", "),
    });
  }

  // JWT Errors
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

  // Default Error
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
};