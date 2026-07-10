import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Dumbbell } from "lucide-react";
import toast from "react-hot-toast";
import { workoutService } from "../services/workoutService.js";
import { WORKOUT_CATEGORIES, DIFFICULTY_LEVELS } from "../utils/helpers.js";

// Coerce empty strings to null for optional number fields
const optionalInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
  z.number().int().min(1).nullable().optional()
);

const optionalFloat = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
  z.number().min(0).nullable().optional()
);

const schema = z.object({
  exercise: z.string().min(1, "Exercise name is required").max(100),
  category: z.enum(["Strength", "Cardio", "Flexibility", "HIIT", "Sports", "Yoga", "CrossFit", "Other"]),
  duration: z.preprocess(
    (v) => (v === "" ? undefined : Number(v)),
    z.number({ required_error: "Duration is required" }).min(1, "At least 1 minute").max(600)
  ),
  caloriesBurned: z.preprocess(
    (v) => (v === "" ? 0 : Number(v)),
    z.number().min(0).default(0)
  ),
  sets: optionalInt,
  reps: optionalInt,
  weight: optionalFloat,
  notes: z.string().max(500).optional().nullable().or(z.literal("")),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
});

export default function WorkoutForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "Other",
      difficulty: "Medium",
      date: new Date().toISOString().split("T")[0],
      caloriesBurned: "",
      sets: "",
      reps: "",
      weight: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isEdit) {
      workoutService
        .getOne(id)
        .then((data) => {
          const w = data.workout;
          reset({
            exercise: w.exercise,
            category: w.category,
            duration: w.duration,
            caloriesBurned: w.caloriesBurned ?? "",
            sets: w.sets ?? "",
            reps: w.reps ?? "",
            weight: w.weight ?? "",
            notes: w.notes ?? "",
            date: w.date,
            difficulty: w.difficulty,
          });
        })
        .catch(() => {
          toast.error("Could not load workout.");
          navigate("/workouts");
        });
    }
  }, [id, isEdit, reset, navigate]);

  const onSubmit = async (data) => {
    // notes: treat empty string as null
    const payload = {
      ...data,
      notes: data.notes === "" ? null : data.notes,
    };

    try {
      if (isEdit) {
        await workoutService.update(id, payload);
        toast.success("Workout updated!");
      } else {
        await workoutService.create(payload);
        toast.success("Workout logged!");
      }
      navigate("/workouts");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">
            {isEdit ? "Edit Workout" : "Log Workout"}
          </h1>
          <p className="text-slate-500 text-xs">
            {isEdit ? "Update your workout details" : "Record your training session"}
          </p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit(onSubmit)}
        className="glass-card p-6 space-y-5"
      >
        {/* Exercise & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Exercise Name *</label>
            <input
              {...register("exercise")}
              placeholder="e.g. Bench Press"
              className="input-field"
              autoFocus={!isEdit}
            />
            {errors.exercise && (
              <p className="text-red-400 text-xs mt-1">{errors.exercise.message}</p>
            )}
          </div>
          <div>
            <label className="label">Category *</label>
            <select {...register("category")} className="input-field cursor-pointer">
              {WORKOUT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration & Calories */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Duration (minutes) *</label>
            <input
              {...register("duration")}
              type="number"
              min="1"
              max="600"
              placeholder="30"
              className="input-field"
            />
            {errors.duration && (
              <p className="text-red-400 text-xs mt-1">{errors.duration.message}</p>
            )}
          </div>
          <div>
            <label className="label">Calories Burned</label>
            <input
              {...register("caloriesBurned")}
              type="number"
              min="0"
              placeholder="250"
              className="input-field"
            />
          </div>
        </div>

        {/* Sets, Reps, Weight */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Sets</label>
            <input
              {...register("sets")}
              type="number"
              min="1"
              placeholder="4"
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Reps</label>
            <input
              {...register("reps")}
              type="number"
              min="1"
              placeholder="12"
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Weight (kg)</label>
            <input
              {...register("weight")}
              type="number"
              min="0"
              step="0.5"
              placeholder="60"
              className="input-field"
            />
          </div>
        </div>

        {/* Difficulty & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Difficulty *</label>
            <select {...register("difficulty")} className="input-field cursor-pointer">
              {DIFFICULTY_LEVELS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date *</label>
            <input {...register("date")} type="date" className="input-field" />
            {errors.date && (
              <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes</label>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="How did the workout feel? Any PRs?"
            className="input-field resize-none"
          />
          {errors.notes && (
            <p className="text-red-400 text-xs mt-1">{errors.notes.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={15} />
                {isEdit ? "Update Workout" : "Log Workout"}
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
}
