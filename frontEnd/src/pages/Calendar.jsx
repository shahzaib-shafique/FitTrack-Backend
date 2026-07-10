import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkouts } from "../hooks/useWorkouts.js";
import { CATEGORY_ICONS, DIFFICULTY_COLOR, formatDuration } from "../utils/helpers.js";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Calendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Fetch all workouts with a high limit so we can build the calendar map
  const { workouts, loading } = useWorkouts({ limit: 500, sort: "-date" });

  // Build date → workouts map
  const workoutMap = useMemo(() => {
    const map = {};
    workouts.forEach((w) => {
      if (!map[w.date]) map[w.date] = [];
      map[w.date].push(w);
    });
    return map;
  }, [workouts]);

  // Build calendar grid
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const formatKey = (d) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const todayStr = today.toISOString().split("T")[0];
  const selectedKey = selectedDay ? formatKey(selectedDay) : null;
  const selectedWorkouts = selectedKey ? workoutMap[selectedKey] || [] : [];

  const prevMonth = () => {
    setSelectedDay(null);
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDay(null);
    setViewDate(new Date(year, month + 1, 1));
  };

  // Calculate monthly stats
  const monthlyTotal = Object.keys(workoutMap).filter((date) =>
    date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)
  ).reduce((acc, date) => acc + workoutMap[date].length, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Calendar</h1>
        <p className="text-slate-500 text-sm">
          {monthlyTotal > 0
            ? `${monthlyTotal} workout${monthlyTotal !== 1 ? "s" : ""} this month`
            : "Your workout schedule"}
        </p>
      </div>

      {/* Calendar card */}
      <div className="glass-card p-4 sm:p-6">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <h2 className="text-base font-bold text-white">
              {MONTHS[month]} {year}
            </h2>
          </div>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        {loading ? (
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;

              const key = formatKey(day);
              const dayWorkouts = workoutMap[key] || [];
              const isToday = key === todayStr;
              const isSelected = day === selectedDay;
              const hasWorkouts = dayWorkouts.length > 0;

              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl text-sm transition-all duration-200 ${
                    isSelected
                      ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
                      : isToday
                      ? "bg-slate-700 text-white font-bold ring-1 ring-emerald-500/40"
                      : hasWorkouts
                      ? "hover:bg-slate-800/70 text-white bg-slate-800/30"
                      : "hover:bg-slate-800/40 text-slate-500"
                  }`}
                >
                  <span className="text-xs leading-none">{day}</span>
                  {hasWorkouts && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-1">
                      {dayWorkouts.slice(0, 3).map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? "bg-emerald-400" : "bg-emerald-500"
                          }`}
                        />
                      ))}
                      {dayWorkouts.length > 3 && (
                        <div className="w-1 h-1 rounded-full bg-slate-500" />
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected day detail */}
      <AnimatePresence mode="wait">
        {selectedDay && (
          <motion.div
            key={selectedKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="glass-card p-5"
          >
            <h3 className="text-sm font-semibold text-white mb-3">
              {MONTHS[month]} {selectedDay}, {year}
              {formatKey(selectedDay) === todayStr && (
                <span className="ml-2 text-xs text-emerald-400 font-normal">Today</span>
              )}
            </h3>

            {selectedWorkouts.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 text-sm mb-3">No workouts on this day.</p>
                <Link
                  to={`/workouts/new`}
                  className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4"
                >
                  <Dumbbell size={14} />
                  Log a Workout
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedWorkouts.map((w) => (
                  <Link key={w._id} to={`/workouts/${w._id}`}>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all"
                    >
                      <span className="text-xl w-8 text-center">
                        {CATEGORY_ICONS[w.category] || "🏋️"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{w.exercise}</p>
                        <p className="text-xs text-slate-500">
                          {w.category} · {formatDuration(w.duration)}
                          {w.caloriesBurned > 0 && ` · ${w.caloriesBurned} kcal`}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
                          DIFFICULTY_COLOR[w.difficulty]
                        }`}
                      >
                        {w.difficulty}
                      </span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-500">Workout logged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-md ring-1 ring-emerald-500/40 bg-slate-700" />
          <span className="text-xs text-slate-500">Today</span>
        </div>
      </div>
    </div>
  );
}
