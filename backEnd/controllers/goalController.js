import Goal from "../models/Goal.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// GET /api/goals
export const getGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ user_id: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, goals });
});

// GET /api/goals/:id
export const getGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user_id: req.user._id });
  if (!goal) throw new AppError("Goal not found.", 404);
  res.status(200).json({ success: true, goal });
});

// POST /api/goals
export const createGoal = asyncHandler(async (req, res) => {
  const { title, targetDate } = req.body;
  if (!title || !targetDate) throw new AppError("Title and target date are required.", 400);
  const goal = await Goal.create({ title, targetDate, user_id: req.user._id });
  res.status(201).json({ success: true, goal });
});

// PATCH /api/goals/:id
export const updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    { ...req.body },
    { new: true, runValidators: true }
  );
  if (!goal) throw new AppError("Goal not found.", 404);
  res.status(200).json({ success: true, goal });
});

// DELETE /api/goals/:id
export const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
  if (!goal) throw new AppError("Goal not found.", 404);
  res.status(200).json({ success: true, message: "Goal deleted." });
});
