import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { COOKIE_NAME_EXPORT as COOKIE_NAME } from "../utils/jwt.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    throw new AppError("Authentication required. Please log in.", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Session expired or invalid. Please log in again.", 401);
  }

  const user = await User.findById(decoded._id).select("-password");
  if (!user) {
    throw new AppError("User no longer exists.", 401);
  }

  req.user = user;
  next();
});

export default requireAuth;
