import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, Search, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { workoutService } from "../services/workoutService.js";
import { authService } from "../services/authService.js";
import { WORKOUT_CATEGORIES, DIFFICULTY_LEVELS, CATEGORY_ICONS } from "../utils/helpers.js";

const PREDEFINED_EXERCISES = [
  { name: "Bench Press", category: "Strength" },
  { name: "Chest Press", category: "Strength" },
  { name: "Squat", category: "Strength" },
  { name: "Deadlift", category: "Strength" },
  { name: "Pull Up", category: "Strength" },
  { name: "Push Up", category: "Strength" },
  { name: "Lat Pulldown", category: "Strength" },
  { name: "Seated Row", category: "Strength" },
  { name: "Shoulder Press", category: "Strength" },
  { name: "Leg Press", category: "Strength" },
  { name: "Leg Extension", category: "Strength" },
  { name: "Leg Curl", category: "Strength" },
  { name: "Bicep Curl", category: "Strength" },
  { name: "Tricep Pushdown", category: "Strength" },
  { name: "Running", category: "Cardio" },
  { name: "Walking", category: "Cardio" },
  { name: "Cycling", category: "Cardio" },
  { name: "Jump Rope", category: "Cardio" },
  { name: "Plank", category: "Flexibility" },
  { name: "Burpees", category: "HIIT" },
  { name: "Mountain Climbers", category: "HIIT" }
];

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
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentExercises, setRecentExercises] = useState([]);
  const comboboxRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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

  const selectedCategory = watch("category");
  const selectedDifficulty = watch("difficulty");
  const exerciseValue = watch("exercise");

  useEffect(() => {
    if (!isEdit) {
      authService.getMe()
        .then((data) => {
          if (data?.user?.recentExercises) {
            setRecentExercises(data.user.recentExercises);
          }
        })
        .catch((err) => console.error("Error fetching recent exercises:", err));
    }
  }, [isEdit]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          setSearchQuery(w.exercise);
        })
        .catch(() => {
          toast.error("Could not load workout.");
          navigate("/workouts");
        });
    }
  }, [id, isEdit, reset, navigate]);

  const handleSelectExercise = (name, category) => {
    setValue("exercise", name, { shouldValidate: true });
    setSearchQuery(name);
    if (category) {
      setValue("category", category, { shouldValidate: true });
    }
    setIsOpen(false);
  };

  const filteredExercises = PREDEFINED_EXERCISES.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = async (data) => {
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
    <div className="max-w-2xl mx-auto space-y-4 px-1 sm:px-0 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mt-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-95"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white sm:text-xl">
            {isEdit ? "Edit Workout" : "Log Workout"}
          </h1>
          <p className="text-slate-500 text-[11px] sm:text-xs">
            {isEdit ? "Update your workout details" : "Record your training session"}
          </p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onSubmit={handleSubmit(onSubmit)}
        className="glass-card p-4 sm:p-6 space-y-4"
      >
        {/* Recent Exercises Block */}
        {recentExercises.length > 0 && !isEdit && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Clock size={11} /> Recent Exercises
            </label>
            <div className="flex flex-wrap gap-1.5">
              {recentExercises.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    const found = PREDEFINED_EXERCISES.find(p => p.name.toLowerCase() === ex.toLowerCase());
                    handleSelectExercise(ex, found?.category || null);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all duration-200 bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-500 hover:text-white ${
                    exerciseValue?.toLowerCase() === ex.toLowerCase() ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : ""
                  }`}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exercise Input Field */}
        <div className="relative" ref={comboboxRef}>
          <label className="label text-xs">Exercise Name *</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setValue("exercise", e.target.value, { shouldValidate: true });
                const matchingExercise = PREDEFINED_EXERCISES.find(
                  (ex) => ex.name.toLowerCase() === e.target.value.toLowerCase()
                );
                if (matchingExercise) {
                  setValue("category", matchingExercise.category, { shouldValidate: true });
                }
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search or type exercise..."
              className="input-field pl-10"
              autoFocus={!isEdit}
            />
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
          {errors.exercise && (
            <p className="text-red-400 text-xs mt-1">{errors.exercise.message}</p>
          )}

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl max-h-48 overflow-y-auto shadow-2xl backdrop-blur-xl"
              >
                {filteredExercises.length > 0 ? (
                  filteredExercises.map((ex) => (
                    <button
                      key={ex.name}
                      type="button"
                      onClick={() => handleSelectExercise(ex.name, ex.category)}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white flex items-center justify-between transition-colors border-b border-slate-800/50 last:border-0"
                    >
                      <span className="font-medium">{ex.name}</span>
                      <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-md text-slate-400">
                        {ex.category}
                      </span>
                    </button>
                  ))
                ) : (
                  searchQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-left px-4 py-3 text-sm text-slate-400 italic"
                    >
                      Use custom: "{searchQuery}"
                    </button>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category Selection Elements */}
        <div>
          <label className="label text-xs">Category *</label>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-0.5">
            {WORKOUT_CATEGORIES.map((c) => {
              const isSelected = selectedCategory === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue("category", c, { shouldValidate: true })}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-sm"
                      : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration & Calories Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label text-xs">Duration (mins) *</label>
            <input
              {...register("duration")}
              type="number"
              min="1"
              max="600"
              placeholder="30"
              className="input-field text-sm"
            />
            {errors.duration && (
              <p className="text-red-400 text-xs mt-1">{errors.duration.message}</p>
            )}
          </div>
          <div>
            <label className="label text-xs">Calories Burned</label>
            <input
              {...register("caloriesBurned")}
              type="number"
              min="0"
              placeholder="250"
              className="input-field text-sm"
            />
          </div>
        </div>

        {/* Sets, Reps, Weight Custom Numeric Flex Layout */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div>
            <label className="label text-xs">Sets</label>
            <input
              {...register("sets")}
              type="number"
              min="1"
              placeholder="4"
              className="input-field text-sm px-2.5 text-center sm:text-left"
            />
          </div>
          <div>
            <label className="label text-xs">Reps</label>
            <input
              {...register("reps")}
              type="number"
              min="1"
              placeholder="12"
              className="input-field text-sm px-2.5 text-center sm:text-left"
            />
          </div>
          <div>
            <label className="label text-xs">Weight (kg)</label>
            <input
              {...register("weight")}
              type="number"
              min="0"
              step="0.5"
              placeholder="60"
              className="input-field text-sm px-2.5 text-center sm:text-left"
            />
          </div>
        </div>

        {/* Difficulty Selection & Calendar Target */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label text-xs">Difficulty *</label>
            <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
              {DIFFICULTY_LEVELS.map((d) => {
                const isSelected = selectedDifficulty === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setValue("difficulty", d, { shouldValidate: true })}
                    className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      isSelected
                        ? "bg-slate-700 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label text-xs">Date *</label>
            <input {...register("date")} type="date" className="input-field text-sm cursor-pointer" />
            {errors.date && (
              <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>
            )}
          </div>
        </div>

        {/* Text Area for Notes */}
        <div>
          <label className="label text-xs">Notes</label>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="How did the workout feel? Any PRs?"
            className="input-field text-sm resize-none"
          />
          {errors.notes && (
            <p className="text-red-400 text-xs mt-1">{errors.notes.message}</p>
          )}
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex flex-col-reverse xs:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary w-full xs:flex-1 py-2.5 text-sm"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full xs:flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={15} />
                <span>{isEdit ? "Update Workout" : "Log Workout"}</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
}