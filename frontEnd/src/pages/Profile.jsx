import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User, Save, Award, Flame, Dumbbell } from "lucide-react";
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
  const { user, updateUser } = useAuth();
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
        bio: "", // Empty to show native placeholder style on load
        weight: "", // Empty to show native placeholder style on load
        height: "", // Empty to show native placeholder style on load
        fitnessGoal: user.fitnessGoal || "stay_active",
        weeklyGoal: "", // Empty to show native placeholder style on load
        dailyWaterGoal: "", // Empty to show native placeholder style on load
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
      
      // Clear specific input values back to empty strings right after saving to bring back the placeholders
      reset({
        ...data,
        bio: "",
        weight: "",
        height: "",
        weeklyGoal: "",
        dailyWaterGoal: "",
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const profileStats = [
    { icon: Dumbbell, label: "Total Workouts", value: stats?.totalWorkouts ?? "—", color: "text-emerald-400" },
    { icon: Flame, label: "Calories Burned", value: stats ? stats.totalCalories.toLocaleString() : "—", color: "text-orange-400" },
    { icon: Award, label: "Current Streak", value: stats ? `${stats.streak}d` : "—", color: "text-cyan-400" },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-2 sm:px-0">
      {/* Avatar + stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-emerald-500/20">
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            {user?.bio && <p className="text-slate-500 text-xs mt-1 max-w-sm">{user.bio}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {profileStats.map((s) => (
            <div key={s.label} className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/50">
              <s.icon size={14} className={`${s.color} mx-auto mb-1`} />
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Edit form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="glass-card p-6 space-y-5"
      >
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <User size={16} className="text-emerald-400" />
          Edit Profile
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
          className="btn-primary w-full flex items-center justify-center gap-2"
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
      </motion.form>
    </div>
  );
}