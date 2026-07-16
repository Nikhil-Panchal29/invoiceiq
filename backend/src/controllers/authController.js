const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const ErrorResponse = require("../utils/ErrorResponse");

// ==========================================
// Helper - Send JWT Token
// ==========================================

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateJWT();

  const cookieOptions = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

// ==========================================
// Register User
// ==========================================

const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(
      new ErrorResponse("Email already registered", 400)
    );
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  sendTokenResponse(user, 201, res);
});

// ==========================================
// Login User
// ==========================================

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ErrorResponse(
        "Please provide email and password",
        400
      )
    );
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(
      new ErrorResponse("Invalid credentials", 401)
    );
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(
      new ErrorResponse("Invalid credentials", 401)
    );
  }

  sendTokenResponse(user, 200, res);
});

// ==========================================
// Get Logged In User
// ==========================================

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

module.exports = {
  register,
  login,
  getMe,
};