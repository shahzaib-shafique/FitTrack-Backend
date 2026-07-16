import User from "../models/User.js";
import { setCookieToken, clearCookieToken } from "../utils/jwt.js";
import { validate, registerSchema, loginSchema } from "../utils/validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { OAuth2Client } from "google-auth-library"; // <-- Import Google's Client library

const client = new OAuth2Client();

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

// POST /api/auth/google
// NEW: Fully integrated, secure production-ready Google Authentication
export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  console.log("--- GOOGLE LOGIN DEBUG ---");
  console.log("Received ID Token (first 20 chars):", idToken?.substring(0, 20));
  console.log("Backend Client ID in process.env:", process.env.GOOGLE_CLIENT_ID);
  console.log("--------------------------");

  if (!idToken) {
    throw new AppError("Google authentication token is missing.", 400);
  }

  // Debug statement to confirm your environment variable is loaded
  console.log("Using GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

  let payload;
  try {
    // 2. Verify the token, passing the environment variable inside the verification check
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID, // Loaded safely when the API is hit
    });
    payload = ticket.getPayload();
  } catch (error) {
    console.error("Google Token Verification Error:", error.message);
    throw new AppError("Invalid Google credentials. Please try again.", 401);
  }

  const { email, name, picture, sub: googleId } = payload;

  // 3. Find or register user
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({
      name,
      email,
      avatar: picture,
      googleId,
    });
    await user.save();
  } else {
    let updated = false;
    if (!user.googleId) {
      user.googleId = googleId;
      updated = true;
    }
    if (picture && !user.avatar) {
      user.avatar = picture;
      updated = true;
    }
    if (updated) {
      await user.save();
    }
  }

  // 4. Attach cookie
  setCookieToken(res, user._id);

  // 5. Send payload back to front-end
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