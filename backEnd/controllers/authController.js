import User from "../models/User.js";
import { setCookieToken, clearCookieToken } from "../utils/jwt.js";
import { validate, registerSchema, loginSchema } from "../utils/validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { success, data, errors } = validate(registerSchema, req.body);
  if (!success) {
    return res.status(400).json({ success: false, errors });
  }

  const { name, email, password } = data;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const user = await User.create({ name, email, password });

  setCookieToken(res, user._id);

  res.status(201).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      fitnessGoal: user.fitnessGoal,
      weeklyGoal: user.weeklyGoal,
      createdAt: user.createdAt,
    },
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { success, data, errors } = validate(loginSchema, req.body);
  if (!success) {
    return res.status(400).json({ success: false, errors });
  }

  const { email, password } = data;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  setCookieToken(res, user._id);

  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      weight: user.weight,
      height: user.height,
      fitnessGoal: user.fitnessGoal,
      weeklyGoal: user.weeklyGoal,
      dailyWaterGoal: user.dailyWaterGoal,
      createdAt: user.createdAt,
    },
  });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  clearCookieToken(res);
  res.status(200).json({ success: true, message: "Logged out successfully." });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  res.status(200).json({ success: true, user });
});
