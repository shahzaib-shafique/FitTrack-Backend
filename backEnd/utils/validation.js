import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be 60 characters or fewer"),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please enter a valid email address"),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please enter a valid email address"),

  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

export const workoutCreateSchema = z.object({
  exercise: z
    .string({ required_error: "Exercise name is required" })
    .trim()
    .min(1, "Exercise name is required")
    .max(100, "Exercise name is too long"),

  category: z
    .enum(
      ["Strength", "Cardio", "Flexibility", "HIIT", "Sports", "Yoga", "CrossFit", "Other"],
      { errorMap: () => ({ message: "Invalid category" }) }
    )
    .default("Other"),

  duration: z
    .number({ required_error: "Duration is required", invalid_type_error: "Duration must be a number" })
    .min(1, "Duration must be at least 1 minute")
    .max(600, "Duration cannot exceed 600 minutes"),

  caloriesBurned: z
    .number({ invalid_type_error: "Calories must be a number" })
    .min(0)
    .optional()
    .default(0),

  sets: z
    .number({ invalid_type_error: "Sets must be a number" })
    .int("Sets must be a whole number")
    .min(1)
    .optional()
    .nullable(),

  reps: z
    .number({ invalid_type_error: "Reps must be a number" })
    .int("Reps must be a whole number")
    .min(1)
    .optional()
    .nullable(),

  weight: z
    .number({ invalid_type_error: "Weight must be a number" })
    .min(0)
    .optional()
    .nullable(),

  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .nullable(),

  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),

  difficulty: z
    .enum(["Easy", "Medium", "Hard"])
    .default("Medium"),
});

export const workoutUpdateSchema = workoutCreateSchema.partial();

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60)
    .optional(),

  bio: z.string().max(300).optional().nullable(),

  // Changed to coerce.number() to handle string/number inputs
  weight: z.coerce.number().min(20).max(500).optional().nullable(),

  // Changed to coerce.number() to allow floating-point values (decimals like 172.2)
  height: z.coerce.number().min(50).max(300).optional().nullable(),

  fitnessGoal: z
    .enum(["lose_weight", "build_muscle", "improve_endurance", "stay_active", "other"])
    .optional(),

  weeklyGoal: z.coerce.number().int().min(1).max(7).optional(),

  // Removed .int() and changed to coerce.number() to allow decimal water amounts (e.g., 2.5L)
  dailyWaterGoal: z.coerce.number().min(0.5).max(30).optional(),
});

/**
 * Validates req.body against a Zod schema.
 * Returns { success, data, errors }.
 */
export const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map((e) => ({
    field: e.path.join("."),
    message: e.message,
  }));

  return { success: false, errors };
};
