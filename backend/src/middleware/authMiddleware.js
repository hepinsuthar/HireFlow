const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) throw new AppError("Authentication required. Provide a Bearer token.", 401);
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired token.", 401);
  }
  const user = await User.findById(decoded.userId).select("_id role isActive");
  if (!user || !user.isActive) throw new AppError("Account not found or disabled.", 401);
  req.user = { userId: user._id.toString(), role: user.role };
  next();
});

module.exports = { protect };
