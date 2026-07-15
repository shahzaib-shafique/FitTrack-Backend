import express from "express";
import { getGoals, getGoal, createGoal, updateGoal, deleteGoal } from "../controllers/goalController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getGoals);
router.get("/:id", getGoal);
router.post("/", createGoal);
router.patch("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
