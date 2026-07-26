import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User, Save, Award, Flame, Dumbbell, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import { userService } from "../services/userService.js";
import { useWorkoutStats } from "../hooks/useWorkouts.js";
import { getInitials, FITNESS_GOALS } from "../utils/helpers.js";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  bio: z.string().max(300).optional().or(z.literal("")),
  weight: z.coerce.number().min(20).max(500).optional().or(z.literal("")),
  height: z.coerce.number().min(50).max(300).optional().or(z.literal("")),
  fitnessGoal: z.enum(["lose_weight", "build_muscle", "improve_endurance", "stay_active", "other"]),
  weeklyGoal: z.coerce.number().int().min(1).max(7).optional().or(z.literal("")),
  dailyWaterGoal: z.coerce.number().min(0.5).max(10).optional().or(z.literal("")),
});

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { stats } = useWorkoutStats();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      bio: "",
      weight: "",
      height: "",
      fitnessGoal: "stay_active",
      weeklyGoal: "",
      dailyWaterGoal: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        bio: user.bio || "",
        weight: user.weight ?? "",
        height: user.height ?? "",
        fitnessGoal: user.fitnessGoal || "stay_active",
        weeklyGoal: user.weeklyGoal ?? "",
        dailyWaterGoal: user.dailyWaterGoal ?? "",
      });
    }
  }, [user, reset]);

const onSubmit = async (data) => {
    const payload = {
      ...data,
      weight: data.weight === "" ? null : Number(data.weight),
      height: data.height === "" ? null : parseFloat(data.height),
      weeklyGoal: data.weeklyGoal === "" ? null : Number(data.weeklyGoal),
      dailyWaterGoal: data.dailyWaterGoal === "" ? null : Number(data.dailyWaterGoal),
      bio: data.bio === "" ? null : data.bio,
    };
    try {
      const res = await userService.updateProfile(payload);
      updateUser(res.user);
      
      // Explicitly reset the form with the fresh server response to clear isDirty state
      reset({
        name: res.user.name || "",
        bio: res.user.bio || "",
        weight: res.user.weight ?? "",
        height: res.user.height ?? "",
        fitnessGoal: res.user.fitnessGoal || "stay_active",
        weeklyGoal: res.user.weeklyGoal ?? "",
        dailyWaterGoal: res.user.dailyWaterGoal ?? "",
      });

      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
    } catch (err) {
      toast.error("Failed to sign out");
    }
  };

  const profileStats = [
    { icon: Dumbbell, label: "Total Workouts", value: stats?.totalWorkouts ?? "—", color: "text-emerald-400" },
    { icon: Flame, label: "Calories Burned", value: stats ? stats.totalCalories.toLocaleString() : "—", color: "text-orange-400" },
    { icon: Award, label: "Current Streak", value: stats ? `${stats.streak}d` : "—", color: "text-cyan-400" },
  ];

  const currentGoalLabel = FITNESS_GOALS.find((g) => g.value === user?.fitnessGoal)?.label || "Stay Active";

  // Calculate BMI dynamically from weight and height
  const calculateBMI = (w, h) => {
    if (!w || !h) return null;
    const heightInMeters = h / 100;
    return (w / (heightInMeters * heightInMeters)).toFixed(1);
  };
  const currentBMI = user?.bmi || calculateBMI(user?.weight, user?.height);

  // Array of quick metrics to guarantee all 5 render cleanly
  const metricsList = [
    { label: "Weight", value: user?.weight ? `${user.weight} kg` : "—" },
    { label: "Height", value: user?.height ? `${user.height} cm` : "—" },
    { label: "BMI", value: currentBMI ? currentBMI : "—", isEmerald: true },
    { label: "Weekly Goal", value: user?.weeklyGoal ? `${user.weeklyGoal} days` : "—" },
    { label: "Hydration", value: user?.dailyWaterGoal ? `${user.dailyWaterGoal} L` : "—" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-0 pb-12">
      
      {/* --- MASTER UNIFIED PROFILE CARD (Fixed padding so avatar doesn't clip) --- */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 pt-8 shadow-2xl space-y-6">
        
        {/* Top row: Avatar, Name, Email, and Goal Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-xl shadow-emerald-500/20 shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{user?.name}</h2>
              <p className="text-slate-400 text-xs sm:text-sm truncate">{user?.email}</p>
            </div>
          </div>

        </div>

        {/* Bio snippet */}
        {user?.bio && (
          <p className="text-slate-300 text-xs sm:text-sm bg-slate-800/40 p-3 rounded-xl border border-slate-700/40 italic">
            "{user.bio}"
          </p>
        )}

        {/* Quick Metrics Grid (Weight, Height, BMI, Weekly Goal, Hydration) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
          {metricsList.map((m, idx) => (
            <div 
              key={m.label} 
              className={`bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40 ${idx === 2 ? "col-span-2 sm:col-span-1" : ""}`}
            >
              <p className="text-[11px] text-slate-400">{m.label}</p>
              <p className={`text-sm font-semibold ${m.isEmerald ? "text-emerald-400" : "text-white"}`}>
                {m.value}
              </p>
            </div>
          ))}
        </div>


        {/* Divider */}
        <hr className="border-slate-700/50 my-2" />

        {/* --- EDIT PROFILE FORM --- */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <User size={16} className="text-emerald-400" />
            Edit Profile Settings
          </h3>

          <div>
            <label className="label">Full Name</label>
            <input {...register("name")} className="input-field" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea 
              {...register("bio")} 
              rows={2} 
              placeholder="A few words about your fitness journey..." 
              className="input-field resize-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Weight (kg)</label>
              <input {...register("weight")} type="number" step="0.1" placeholder="70" className="input-field" />
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input {...register("height")} type="number" step="any" placeholder="175" className="input-field" />
            </div>
          </div>

          <div>
            <label className="label">Fitness Goal</label>
            <select {...register("fitnessGoal")} className="input-field cursor-pointer">
              {FITNESS_GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Weekly Workout Goal</label>
              <input {...register("weeklyGoal")} type="number" min="1" max="7" placeholder="4" className="input-field" />
            </div>
            <div>
              <label className="label">Daily Hydration (L)</label>
              <input {...register("dailyWaterGoal")} type="number" step="0.1" min="0.5" max="10" placeholder="2.5" className="input-field" />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="btn-primary w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 pt-3"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={15} />
                Save Changes
              </>
            )}
          </motion.button>
        </form>

      </motion.div>

      {/* --- SIGN OUT BUTTON --- */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          type="button"
          className="w-full py-3.5 px-4 rounded-xl border border-red-500/30 bg-red-500/15 hover:bg-red-500/25 text-red-400 font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/5 cursor-pointer"
        >
          <LogOut size={18} />
          Sign Out
        </motion.button>
      </motion.div>

    </div>
  );
}