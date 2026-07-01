const ErrorResponse = require("../utils/ErrorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Invalid ObjectId
  if (err.name === "CastError") {
    error = new ErrorResponse("Resource not found", 404);
  }

  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ErrorResponse(
      `Duplicate ${field} value entered`,
      400
    );
  }

  // Validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");

    error = new ErrorResponse(message, 400);
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    error = new ErrorResponse(
      "Invalid token. Please log in again.",
      401
    );
  }

  // JWT expired
  if (err.name === "TokenExpiredError") {
    error = new ErrorResponse(
      "Token expired. Please log in again.",
      401
    );
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;