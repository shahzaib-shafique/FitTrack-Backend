import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { validate, profileUpdateSchema } from "../utils/validation.js";

// GET /api/users/profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) throw new AppError("User not found.", 404);
  res.status(200).json({ success: true, user });
});

// PATCH /api/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { success, data, errors } = validate(profileUpdateSchema, req.body);
  if (!success) {
    return res.status(400).json({ success: false, errors });
  }

  const user = await User.findByIdAndUpdate(req.user._id, data, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(200).json({ success: true, user });
});

// PATCH /api/users/water
export const updateWaterIntake = asyncHandler(async (req, res) => {
  const { glasses } = req.body;

  if (typeof glasses !== "number" || glasses < 0) {
    throw new AppError("Glasses must be a non-negative number.", 400);
  }

  const today = new Date().toISOString().split("T")[0];

  const user = await User.findById(req.user._id);
  if (!user) throw new AppError("User not found.", 404);

  // Reset if it's a new day
  if (user.waterDate !== today) {
    user.waterIntake = 0;
    user.waterDate = today;
  }

  user.waterIntake = glasses;
  await user.save();

  res.status(200).json({
    success: true,
    waterIntake: user.waterIntake,
    waterDate: user.waterDate,
    dailyWaterGoal: user.dailyWaterGoal,
  });
});

// PATCH /api/users/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError("Both current and new password are required.", 400);
  }
  if (newPassword.length < 8) {
    throw new AppError("New password must be at least 8 characters.", 400);
  }

  const user = await User.findById(req.user._id);
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError("Current password is incorrect.", 401);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: "Password updated successfully." });
});
