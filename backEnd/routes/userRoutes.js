import express from "express";
import {
  getProfile,
  updateProfile,
  updateWaterIntake,
  changePassword,
} from "../controllers/userController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.patch("/water", updateWaterIntake);
router.patch("/password", changePassword);

export default router;
