import express from "express";
import { register, login, logout, getMe, googleLogin } from "../controllers/authController.js"; // <-- ADDED googleLogin
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.post("/google", googleLogin);

export default router;