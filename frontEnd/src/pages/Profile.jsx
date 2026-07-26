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

  // Populate form with real saved user data so fields stay filled properly
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
      height: data.height === "" ? null : Number(data.height),
      weeklyGoal: data.weeklyGoal === "" ? null : Number(data.weeklyGoal),
      dailyWaterGoal: data.dailyWaterGoal === "" ? null : Number(data.dailyWaterGoal),
      bio: data.bio === "" ? null : data.bio,
    };
    try {
      const res = await userService.updateProfile(payload);
      updateUser(res.user);
      toast.success("Profile updated!");
      
      // Keep form synchronized with fresh backend values
      reset({
        name: res.user.name || "",
        bio: res.user.bio || "",
        weight: res.user.weight ?? "",
        height: res.user.height ?? "",
        fitnessGoal: res.user.fitnessGoal || "stay_active",
        weeklyGoal: res.user.weeklyGoal ?? "",
        dailyWaterGoal: res.user.dailyWaterGoal ?? "",
      });
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

  // Find human-readable fitness goal label
  const currentGoalLabel = FITNESS_GOALS.find((g) => g.value === user?.fitnessGoal)?.label || "Stay Active";

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-0 pb-12">
      
      {/* --- MASTER UNIFIED PROFILE CARD --- */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden shadow-2xl">
        
        {/* 1. Decorative Top Banner 
        <div className="h-24 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 relative" />*/}

        <div className="px-6 pb-6 pt-0 relative -mt-10 space-y-6">
          
          {/* 2. Top row: Avatar, Name, Email, and Goal Badge */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-emerald-500/20 border-4 border-slate-900 shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="pb-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{user?.name}</h2>
                <p className="text-slate-400 text-xs sm:text-sm truncate">{user?.email}</p>
              </div>
            </div>

            <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
              {currentGoalLabel}
            </span>
          </div>

          {/* Bio snippet */}
          {user?.bio && (
            <p className="text-slate-300 text-xs sm:text-sm bg-slate-800/40 p-3 rounded-xl border border-slate-700/40 italic">
              "{user.bio}"
            </p>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
              <p className="text-[11px] text-slate-400">Weight</p>
              <p className="text-sm font-semibold text-white">{user?.weight ? `${user.weight} kg` : "—"}</p>
            </div>
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
              <p className="text-[11px] text-slate-400">Height</p>
              <p className="text-sm font-semibold text-white">{user?.height ? `${user.height} cm` : "—"}</p>
            </div>
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
              <p className="text-[11px] text-slate-400">Weekly Goal</p>
              <p className="text-sm font-semibold text-white">{user?.weeklyGoal ? `${user.weeklyGoal} days` : "—"}</p>
            </div>
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
              <p className="text-[11px] text-slate-400">Hydration</p>
              <p className="text-sm font-semibold text-white">{user?.dailyWaterGoal ? `${user.dailyWaterGoal} L` : "—"}</p>
            </div>
          </div>

          {/* Core Workout Performance Stats */}
          <div className="grid grid-cols-3 gap-3">
            {profileStats.map((s) => (
              <div key={s.label} className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/50 shadow-inner">
                <s.icon size={16} className={`${s.color} mx-auto mb-1`} />
                <p className="text-base sm:text-lg font-bold text-white">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* --- SUBTLE DIVIDER SEPARATING VIEW FROM EDIT FORM --- */}
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
                <input {...register("height")} type="number" placeholder="175" className="input-field" />
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

        </div>
      </motion.div>

      {/* --- SIGN OUT BUTTON (Kept separate at bottom for safety) --- */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          type="button"
          className="w-full py-3.5 px-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/5 cursor-pointer"
        >
          <LogOut size={18} />
          Sign Out
        </motion.button>
      </motion.div>

    </div>
  );
}