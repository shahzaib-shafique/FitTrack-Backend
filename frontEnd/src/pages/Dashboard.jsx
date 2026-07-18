import { motion } from "framer-motion";
import { Flame, Dumbbell, Clock, Target, Zap, TrendingUp, Plus, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useWorkoutStats, useWorkouts } from "../hooks/useWorkouts.js";
import { StatCardSkeleton, WorkoutCardSkeleton } from "../components/ui/LoadingSkeleton.jsx";
import { WeeklyCaloriesChart } from "../components/charts/WeeklyCaloriesChart.jsx";
import { formatDuration, formatRelativeDate, CATEGORY_ICONS, DIFFICULTY_COLOR } from "../utils/helpers.js";
import { EXERCISE_IMAGES } from "./Workouts.jsx";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", damping: 25 } },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useWorkoutStats();
  const { workouts, loading: workoutsLoading } = useWorkouts({ limit: 5, sort: "-date" });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const statCards = [
    {
      label: "Calories Burned",
      value: stats ? stats.monthCalories.toLocaleString() : "—",
      sub: "This month",
      icon: Flame,
      gradient: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-400",
      border: "border-orange-500/10",
    },
    {
      label: "Workouts",
      value: stats ? stats.monthWorkouts : "—",
      sub: "This month",
      icon: Dumbbell,
      gradient: "from-emerald-500/20 to-cyan-500/20",
      iconColor: "text-emerald-400",
      border: "border-emerald-500/10",
    },
    {
      label: "Active Minutes",
      value: stats ? formatDuration(stats.monthMinutes) : "—",
      sub: "This month",
      icon: Clock,
      gradient: "from-blue-500/20 to-violet-500/20",
      iconColor: "text-blue-400",
      border: "border-blue-500/10",
    },
    {
      label: "Current Streak",
      value: stats ? `${stats.streak}d` : "—",
      sub: "Keep it going!",
      icon: Zap,
      gradient: "from-amber-500/20 to-yellow-500/20",
      iconColor: "text-amber-400",
      border: "border-amber-500/10",
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Hero welcome */}
      <motion.div variants={item} className="relative overflow-hidden glass-card p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-transparent" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">{greeting()},</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              {user?.name?.split(" ")[0]} 👋
            </h2>
            <p className="text-slate-400 text-sm max-w-sm">
              {stats?.streak > 0
                ? `You're on a ${stats.streak}-day streak. Don't break it!`
                : "Log your first workout to start your streak!"}
            </p>
          </div>

          {stats && (
            <div className="shrink-0 text-right">
              <p className="text-xs text-slate-500 mb-1">Weekly Goal</p>
              <div className="text-2xl font-black gradient-text">
                {stats.weekWorkouts}/{user?.weeklyGoal || 4}
              </div>
              <p className="text-xs text-slate-500">workouts</p>
            </div>
          )}
        </div>

        {/* Weekly progress bar */}
        {stats && (
          <div className="relative mt-5">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Weekly Progress</span>
              <span>{Math.min(100, Math.round((stats.weekWorkouts / (user?.weeklyGoal || 4)) * 100))}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (stats.weekWorkouts / (user?.weeklyGoal || 4)) * 100)}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsLoading
          ? [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => (
              <motion.div
                key={card.label}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`stat-card bg-gradient-to-br ${card.gradient} border ${card.border}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-medium text-slate-400">{card.label}</p>
                  <div className="p-1.5 bg-slate-800/50 rounded-lg">
                    <card.icon size={14} className={card.iconColor} />
                  </div>
                </div>
                <p className="text-2xl font-black text-white">{card.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
              </motion.div>
            ))}
      </motion.div>

      {/* Charts row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Weekly Calories</h3>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          {statsLoading ? (
            <div className="h-48 bg-slate-800/50 rounded-xl animate-pulse" />
          ) : (
            <WeeklyCaloriesChart data={stats?.weeklyCalories || []} />
          )}
        </div>
      </motion.div>

      {/* Recent workouts */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Recent Workouts</h3>
          <Link
            to="/workouts"
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        <div className="space-y-3">
          {workoutsLoading ? (
            [...Array(3)].map((_, i) => <WorkoutCardSkeleton key={i} />)
          ) : workouts.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <div className="text-4xl mb-3">🏋️</div>
              <p className="text-slate-400 text-sm mb-4">No workouts yet. Let's start moving!</p>
              <Link to="/workouts/new" className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2">
                <Plus size={14} />
                Log Workout
              </Link>
            </div>
          ) : (
            workouts.map((workout, i) => (
              <motion.div
                key={workout._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <RecentWorkoutCard workout={workout} />
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function RecentWorkoutCard({ workout }) {
  // Normalize string for exact key matching down below
  const exerciseKey = (workout.exercise || "").toLowerCase().trim();
  const matchedImageUrl = EXERCISE_IMAGES?.[exerciseKey] || EXERCISE_IMAGES?.["default"];

  return (
    <Link to={`/workouts/${workout._id}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="glass-card-hover p-4 flex items-center gap-4"
      >
        {/* Swapped standard background for the custom dynamic cover image badge */}
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
          <img 
            src={matchedImageUrl} 
            alt={workout.exercise} 
            className="w-full h-full object-cover opacity-70 contrast-125 brightness-90 saturate-[85%]"
            loading="lazy"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate capitalize">{workout.exercise}</p>
          <p className="text-xs text-slate-500">{formatRelativeDate(workout.date)}</p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-400">{formatDuration(workout.duration)}</span>
          {workout.caloriesBurned > 0 && (
            <span className="text-xs text-orange-400">{workout.caloriesBurned} kcal</span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFFICULTY_COLOR[workout.difficulty]}`}>
            {workout.difficulty}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}