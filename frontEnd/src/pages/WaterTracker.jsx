import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Droplets, Plus, Minus, Target, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import { userService } from "../services/userService.js";

export default function WaterTracker() {
  const { user, updateUser } = useAuth();
  const [glasses, setGlasses] = useState(0);
  const [goal, setGoal] = useState(8);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split("T")[0];
      setGoal(user.dailyWaterGoal || 8);
      setGlasses(user.waterDate === today ? user.waterIntake || 0 : 0);
    }
  }, [user]);

  const update = async (newValue) => {
    const clamped = Math.max(0, Math.min(30, newValue));
    setGlasses(clamped);
    setSaving(true);
    try {
      const data = await userService.updateWater(clamped);
      updateUser({ waterIntake: data.waterIntake, waterDate: data.waterDate });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const pct = Math.min(100, Math.round((glasses / goal) * 100));
  const remaining = Math.max(0, goal - glasses);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Hydration Tracker</h1>
        <p className="text-slate-500 text-sm">Stay hydrated throughout the day</p>
      </div>

      {/* Main water card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 text-center"
      >
        {/* Water animation */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="url(#waterGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - pct / 100) }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="waterGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Droplets size={20} className="text-cyan-400 mb-1" />
            <p className="text-2xl font-black text-white">{pct}%</p>
          </div>
        </div>

        <p className="text-4xl font-black text-white mb-1">
          {glasses} <span className="text-xl text-slate-400 font-normal">/ {goal}</span>
        </p>
        <p className="text-slate-400 text-sm mb-2">glasses today</p>
        {remaining > 0 ? (
          <p className="text-cyan-400 text-xs">{remaining} more to reach your goal</p>
        ) : (
          <p className="text-emerald-400 text-xs font-medium">Daily goal achieved! 🎉</p>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => update(glasses - 1)}
            disabled={glasses === 0 || saving}
            className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center disabled:opacity-40 transition-all active:scale-95"
          >
            <Minus size={18} />
          </button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => update(glasses + 1)}
            disabled={saving}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-all"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus size={22} />
            )}
          </motion.button>

          <button
            onClick={() => update(0)}
            disabled={glasses === 0 || saving}
            className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-40 transition-all active:scale-95"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </motion.div>

      {/* Visual glasses */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-5"
      >
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Target size={14} className="text-cyan-400" />
          Daily Progress — {goal} glass goal
        </h3>
        <div className="grid grid-cols-8 gap-2">
          {[...Array(goal)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => update(i < glasses ? i : i + 1)}
              className={`aspect-square rounded-xl flex items-center justify-center text-lg cursor-pointer transition-all duration-200 ${
                i < glasses
                  ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/40"
                  : "bg-slate-800/50 border border-slate-700/50 hover:border-slate-600"
              }`}
            >
              <span className={i < glasses ? "opacity-100" : "opacity-30"}>💧</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tip */}
      <div className="glass-card p-4 border border-cyan-500/10 bg-cyan-500/5">
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="text-cyan-400 font-medium">Tip:</span> Drink a glass of water when you wake up, before each meal, and after workouts to stay consistently hydrated.
        </p>
      </div>
    </div>
  );
}
