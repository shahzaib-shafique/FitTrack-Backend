
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import AppError from "./utils/AppError.js";


const app = express();
const PORT = process.env.PORT || 8000;

// Security headers
// Replace app.use(helmet()); with this:
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

// CORS — allow the frontend origin with credentials
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting — 100 requests per 15 minutes per IP
/* const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again in 15 minutes.",
  },
});
app.use("/api", limiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  },
}); */

// Body & cookie parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/users", userRoutes);
app.use("/api/goals", goalRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "FitTrack API is running." });
});

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
});

// Global error handler
app.use(errorHandler);

// Start server after DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 FitTrack API running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🌐 CORS Origin: ${process.env.CLIENT_URL || "http://localhost:5173"}\n`);
  });
});

export default app;
