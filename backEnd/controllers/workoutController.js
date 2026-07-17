import Workout from "../models/Workout.js";
import User from "../models/User.js"; // IMPORTED: Need User model to update recents
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { validate, workoutCreateSchema, workoutUpdateSchema } from "../utils/validation.js";

// Helper utility to maintain unique recent exercise lists up to 5 items
const updateRecentExercises = async (userId, exerciseName) => {
  if (!exerciseName) return;
  const user = await User.findById(userId);
  if (!user) return;

  // Filter out the exercise if it already exists, then unshift to front
  let updatedRecents = [
    exerciseName, 
    ...user.recentExercises.filter((ex) => ex.toLowerCase() !== exerciseName.toLowerCase())
  ];
  
  // Keep the 5 most recent records
  user.recentExercises = updatedRecents.slice(0, 5);
  await user.save();
};

// GET /api/workouts
export const getWorkouts = asyncHandler(async (req, res) => {
  const { search, category, difficulty, sort = "-date", page = 1, limit = 20 } = req.query;

  const filter = { user_id: req.user._id };

  if (search) {
    filter.exercise = { $regex: search, $options: "i" };
  }
  if (category && category !== "All") {
    filter.category = category;
  }
  if (difficulty && difficulty !== "All") {
    filter.difficulty = difficulty;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [workouts, total] = await Promise.all([
    Workout.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Workout.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    workouts,
  });
});

// GET /api/workouts/stats
export const getWorkoutStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysStr = sevenDaysAgo.toISOString().split("T")[0];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysStr = thirtyDaysAgo.toISOString().split("T")[0];

  const [allTime, last30, last7, categoryBreakdown, weeklyCalories] = await Promise.all([
    Workout.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalCalories: { $sum: "$caloriesBurned" },
          totalMinutes: { $sum: "$duration" },
        },
      },
    ]),
    Workout.aggregate([
      { $match: { user_id: userId, date: { $gte: thirtyDaysStr } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          calories: { $sum: "$caloriesBurned" },
          minutes: { $sum: "$duration" },
        },
      },
    ]),
    Workout.find({ user_id: userId, date: { $gte: sevenDaysStr } }).lean(),
    Workout.aggregate([
      { $match: { user_id: userId } },
      { $group: { _id: "$category", count: { $sum: 1 }, calories: { $sum: "$caloriesBurned" } } },
      { $sort: { count: -1 } },
    ]),
    Workout.aggregate([
      { $match: { user_id: userId, date: { $gte: sevenDaysStr } } },
      {
        $group: {
          _id: "$date",
          calories: { $sum: "$caloriesBurned" },
          count: { $sum: 1 },
          minutes: { $sum: "$duration" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const allWorkoutDates = await Workout.find({ user_id: userId })
    .select("date")
    .sort("-date")
    .lean();

  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  const dateSet = new Set(allWorkoutDates.map((w) => w.date));

  let check = today;
  while (dateSet.has(check)) {
    streak++;
    const d = new Date(check);
    d.setDate(d.getDate() - 1);
    check = d.toISOString().split("T")[0];
  }

  const totalStats = allTime[0] || { totalWorkouts: 0, totalCalories: 0, totalMinutes: 0 };
  const monthStats = last30[0] || { count: 0, calories: 0, minutes: 0 };

  res.status(200).json({
    success: true,
    stats: {
      totalWorkouts: totalStats.totalWorkouts,
      totalCalories: totalStats.totalCalories,
      totalMinutes: totalStats.totalMinutes,
      monthWorkouts: monthStats.count,
      monthCalories: monthStats.calories,
      monthMinutes: monthStats.minutes,
      weekWorkouts: last7.length,
      weekCalories: last7.reduce((s, w) => s + w.caloriesBurned, 0),
      streak,
      categoryBreakdown,
      weeklyCalories,
    },
  });
});

// GET /api/workouts/:id
export const getWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({ _id: req.params.id, user_id: req.user._id });
  if (!workout) {
    throw new AppError("Workout not found.", 404);
  }
  res.status(200).json({ success: true, workout });
});

// POST /api/workouts
export const createWorkout = asyncHandler(async (req, res) => {
  const { success, data, errors } = validate(workoutCreateSchema, req.body);
  if (!success) {
    return res.status(400).json({ success: false, errors });
  }

  const workout = await Workout.create({ ...data, user_id: req.user._id });

  // CHANGED: Automatically append to the user's recent exercise historical list
  await updateRecentExercises(req.user._id, data.exercise);

  res.status(201).json({ success: true, workout });
});

// PATCH /api/workouts/:id
export const updateWorkout = asyncHandler(async (req, res) => {
  const { success, data, errors } = validate(workoutUpdateSchema, req.body);
  if (!success) {
    return res.status(400).json({ success: false, errors });
  }

  const workout = await Workout.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    data,
    { new: true, runValidators: true }
  );

  if (!workout) {
    throw new AppError("Workout not found.", 404);
  }

  // CHANGED: Update list if exercise identity string gets re-assigned during modifications
  await updateRecentExercises(req.user._id, data.exercise);

  res.status(200).json({ success: true, workout });
});

// DELETE /api/workouts/:id
export const deleteWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOneAndDelete({
    _id: req.params.id,
    user_id: req.user._id,
  });

  if (!workout) {
    throw new AppError("Workout not found.", 404);
  }

  res.status(200).json({ success: true, message: "Workout deleted." });
});