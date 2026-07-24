import express from "express";
import rateLimit from "express-rate-limit"; // <-- ADDED THIS IMPORT
import { register, login, logout, getMe, googleLogin } from "../controllers/authController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// Stricter limiter specifically for manual authentication attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:40, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  },
}); 

// Apply authLimiter strictly to standard email/password routes
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

// Keep these routes unrestricted to prevent blocking valid users
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.post("/google", googleLogin);

export default router;