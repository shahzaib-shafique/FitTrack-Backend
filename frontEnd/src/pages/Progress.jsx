import { motion } from "framer-motion";
import { Flame, Clock, Dumbbell, Zap } from "lucide-react";
import { useWorkoutStats } from "../hooks/useWorkouts.js";
import { MonthlyProgressChart } from "../components/charts/MonthlyProgressChart.jsx";
import { WeeklyCaloriesChart } from "../components/charts/WeeklyCaloriesChart.jsx";
import { StatCardSkeleton } from "../components/ui/LoadingSkeleton.jsx";
import { formatDuration } from "../utils/helpers.js";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", damping: 25 } },
};

export default function Progress() {
  const { stats, loading } = useWorkoutStats();

  // Targets calculated from active stats data
  const workoutGoal = 4; 
  const currentWorkouts = stats ? Math.min(stats.weekWorkouts || 2, workoutGoal) : 0;
  const workoutPercentage = (currentWorkouts / workoutGoal) * 100;

  const activeMinutesGoal = 150;
  const currentMinutes = stats ? Math.min(stats.weekMinutes || 30, activeMinutesGoal) : 0;
  const minutesPercentage = (currentMinutes / activeMinutesGoal) * 100;

  const allTimeStats = [
    {
      label: "Total Workouts",
      value: stats ? stats.totalWorkouts.toLocaleString() : "—",
      icon: Dumbbell,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10 border-emerald-400/10",
    },
    {
      label: "Total Calories",
      value: stats ? `${stats.totalCalories.toLocaleString()}` : "—",
      sub: "kcal",
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-400/10 border-orange-400/10",
    },
    {
      label: "Total Active Time",
      value: stats ? formatDuration(stats.totalMinutes) : "—",
      icon: Clock,
      color: "text-blue-400",
      bg: "bg-blue-400/10 border-blue-400/10",
    },
    {
      label: "Current Streak",
      value: stats ? `${stats.streak} day${stats.streak !== 1 ? "s" : ""}` : "—",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-400/10 border-amber-400/10",
    },
  ];

  const monthStats = [
    {
      label: "This Month",
      value: stats ? stats.monthWorkouts : "—",
      sub: "workouts",
      icon: Dumbbell,
      color: "text-emerald-400",
    },
    {
      label: "This Month",
      value: stats ? stats.monthCalories.toLocaleString() : "—",
      sub: "kcal burned",
      icon: Flame,
      color: "text-orange-400",
    },
    {
      label: "This Month",
      value: stats ? formatDuration(stats.monthMinutes) : "—",
      sub: "active time",
      icon: Clock,
      color: "text-blue-400",
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* All-time stats */}
      <motion.div variants={item}>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">All Time</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading
            ? [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
            : allTimeStats.map((s) => (
                <div
                  key={s.label + s.value}
                  className={`glass-card p-4 border ${s.bg}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon size={14} className={s.color} />
                    <p className="text-xs text-slate-400">{s.label}</p>
                  </div>
                  <p className="text-xl font-bold text-white leading-tight">
                    {s.value}
                    {s.sub && (
                      <span className="text-sm font-normal text-slate-500 ml-1">{s.sub}</span>
                    )}
                  </p>
                </div>
              ))}
        </div>
      </motion.div>

      {/* Monthly stats */}
      <motion.div variants={item}>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">This Month</h2>
        <div className="grid grid-cols-3 gap-3">
          {loading
            ? [...Array(3)].map((_, i) => <StatCardSkeleton key={i} />)
            : monthStats.map((s, i) => (
                <div key={i} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon size={13} className={s.color} />
                  </div>
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
                </div>
              ))}
        </div>
      </motion.div>

      {/* Side-by-Side Grid (Stacked on mobile, split columns on desktop) */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left Side: Weekly Calories Chart */}
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold text-white mb-1">Total Calories</h3>
          <p className="text-xs text-slate-500 mb-4">Last 7 days</p>
          {loading ? (
            <div className="h-48 bg-slate-800/50 rounded-xl animate-pulse" />
          ) : (
            <WeeklyCaloriesChart data={stats?.weeklyCalories || []} />
          )}
        </div>

        {/* Right Side: Weekly Focus Targets Progress Bars */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-white">Weekly Focus Targets</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">Your current weekly objective tracking</p>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse flex-1 justify-center flex flex-col">
              <div className="h-12 bg-slate-800/50 rounded-xl" />
              <div className="h-12 bg-slate-800/50 rounded-xl" />
            </div>
          ) : (
            <div className="space-y-6 flex-1 flex flex-col justify-center pb-2">
              {/* Target 1: Workouts */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 flex items-center gap-2">
                    <Dumbbell size={14} className="text-emerald-400" /> Workout Target
                  </span>
                  <span className="text-slate-400 font-semibold">
                    <span className="text-white font-bold">{currentWorkouts}</span> / {workoutGoal} weekly
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-[1px] border border-slate-800/50">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${workoutPercentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Target 2: Active Time */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 flex items-center gap-2">
                    <Clock size={14} className="text-blue-400" /> Time Dedication
                  </span>
                  <span className="text-slate-400 font-semibold">
                    <span className="text-white font-bold">{currentMinutes}</span> / {activeMinutesGoal} mins
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-[1px] border border-slate-800/50">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${minutesPercentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

      </motion.div>
   
    </motion.div>
  );
}