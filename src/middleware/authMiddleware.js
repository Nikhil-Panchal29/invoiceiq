const jwt = require("jsonwebtoken");

const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const User = require("../models/User");

// ==========================================
// Protect Routes
// ==========================================

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization Header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Fallback to Cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // No Token
  if (!token) {
    return next(
      new ErrorResponse("Not authorized to access this route", 401)
    );
  }

  // Verify Token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Find User
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Attach user to request
  req.user = user;

  next();
});

module.exports = {
  protect,
};