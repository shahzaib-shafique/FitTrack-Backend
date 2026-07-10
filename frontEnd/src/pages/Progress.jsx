import { motion } from "framer-motion";
import { TrendingUp, Flame, Clock, Dumbbell, Award, Zap } from "lucide-react";
import { useWorkoutStats } from "../hooks/useWorkouts.js";
import { MonthlyProgressChart } from "../components/charts/MonthlyProgressChart.jsx";
import { WeeklyCaloriesChart } from "../components/charts/WeeklyCaloriesChart.jsx";
import { CategoryPieChart } from "../components/charts/CategoryPieChart.jsx";
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
      {/* Page title */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-white mb-1">Progress</h1>
        <p className="text-slate-500 text-sm">Your complete fitness journey</p>
      </motion.div>

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

      {/* Monthly activity chart */}
      <motion.div variants={item} className="glass-card p-5">
        <h3 className="text-base font-semibold text-white mb-1">30-Day Activity</h3>
        <p className="text-xs text-slate-500 mb-4">Workout frequency over the past month</p>
        {loading ? (
          <div className="h-52 bg-slate-800/50 rounded-xl animate-pulse" />
        ) : (
          <MonthlyProgressChart data={stats?.weeklyCalories || []} />
        )}
      </motion.div>

      {/* Side-by-side charts */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold text-white mb-1">Weekly Calories</h3>
          <p className="text-xs text-slate-500 mb-4">Last 7 days</p>
          {loading ? (
            <div className="h-48 bg-slate-800/50 rounded-xl animate-pulse" />
          ) : (
            <WeeklyCaloriesChart data={stats?.weeklyCalories || []} />
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="text-base font-semibold text-white mb-1">Category Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">All time distribution</p>
          {loading ? (
            <div className="h-48 bg-slate-800/50 rounded-xl animate-pulse" />
          ) : (
            <CategoryPieChart data={stats?.categoryBreakdown || []} />
          )}
        </div>
      </motion.div>

      {/* Category detail bars */}
      {!loading && stats?.categoryBreakdown?.length > 0 && (
        <motion.div variants={item} className="glass-card p-5">
          <h3 className="text-base font-semibold text-white mb-4">Category Detail</h3>
          <div className="space-y-4">
            {stats.categoryBreakdown.map((cat) => {
              const total = stats.categoryBreakdown.reduce((s, c) => s + c.count, 0);
              const pct = Math.round((cat.count / total) * 100);
              return (
                <div key={cat._id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300 font-medium">{cat._id}</span>
                    <span className="text-slate-500 text-xs">
                      {cat.count} workout{cat.count !== 1 ? "s" : ""} &middot;{" "}
                      {cat.calories.toLocaleString()} kcal &middot; {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && (!stats || stats.totalWorkouts === 0) && (
        <motion.div variants={item} className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-white mb-2">No data yet</h3>
          <p className="text-slate-500 text-sm">Log your first workout to start seeing progress charts.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
