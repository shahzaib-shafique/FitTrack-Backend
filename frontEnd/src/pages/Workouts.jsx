import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, Trash2, Edit3, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { useWorkouts } from "../hooks/useWorkouts.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { workoutService } from "../services/workoutService.js";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { WorkoutCardSkeleton } from "../components/ui/LoadingSkeleton.jsx";
import {
  WORKOUT_CATEGORIES,
  DIFFICULTY_LEVELS,
  DIFFICULTY_COLOR,
  CATEGORY_ICONS,
  formatDuration,
  formatRelativeDate,
} from "../utils/helpers.js";

const SORT_OPTIONS = [
  { value: "-date", label: "Newest First" },
  { value: "date", label: "Oldest First" },
  { value: "-caloriesBurned", label: "Most Calories" },
  { value: "-duration", label: "Longest" },
];

// Predefined image mapping matching your exactly selected exercises with premium dark-aesthetic filters
export const EXERCISE_IMAGES = {
  "bench press": "https://images.stockcake.com/public/9/2/4/924ca5c8-b6bf-4682-8392-197d4f1d7aeb_large/powerful-bench-press-stockcake.jpg",
  "squat": "https://thumbs.dreamstime.com/b/caucasian-muscular-body-builder-sport-man-practice-weight-training-squat-barbell-core-muscle-inside-gym-dark-326689123.jpg",
  "deadlift": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&auto=format&fit=crop&q=80",
  "pull up": "https://wallpaperbat.com/img/150023-workout-picture-download-free-image-stock-photo.jpg",
  "push up": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=150&auto=format&fit=crop&q=80",
  "lat pulldown": "https://thumbs.dreamstime.com/b/man-doing-lat-pulldown-exercise-gym-person-muscular-physique-performing-lat-pulldown-exercise-gym-image-398552209.jpg",
  "seated row": "https://plus.unsplash.com/premium_photo-1661596481527-83400e477159?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "shoulder press": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=150&auto=format&fit=crop&q=80",
  "leg press": "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=150&auto=format&fit=crop&q=80",
  "leg extension": "https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "leg curl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&auto=format&fit=crop&q=80",
  "bicep curl": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150&auto=format&fit=crop&q=80",
  "tricep pushdown": "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=150&auto=format&fit=crop&q=80",
  "running": "https://images.unsplash.com/photo-1609377375724-8fadc82cd50e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "walking": "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=150&auto=format&fit=crop&q=80",
  "cycling": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=150&auto=format&fit=crop&q=80",
  "jump rope": "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=150&auto=format&fit=crop&q=80",
  "plank": "https://i.pinimg.com/originals/c9/dd/3b/c9dd3bc26e74f2ecdbcd260e62615e87.png",
  "burpees": "https://images.unsplash.com/photo-1625151936268-e1ffba534f20?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "mountain climbers": "https://images.unsplash.com/photo-1687360356441-1396b2c5d12f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "chest press":"https://images.unsplash.com/photo-1646072508263-af94f0218bf0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  // Default fallback for custom exercises
  "default": "https://images.unsplash.com/photo-1734630341082-0fec0e10126c?q=80&w=1197&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
};

export default function Workouts() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [sort, setSort] = useState("-date");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const { workouts, total, pages, loading, refetch } = useWorkouts({
    search: debouncedSearch || undefined,
    category: category !== "All" ? category : undefined,
    difficulty: difficulty !== "All" ? difficulty : undefined,
    sort,
    page,
    limit: 10,
  });

  const handleDelete = async () => {
    try {
      await workoutService.delete(deleteTarget);
      toast.success("Workout deleted.");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4 px-1 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 mt-1">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white sm:text-slate-300 sm:font-semibold">Recorded Sessions</span>
            <span className="bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded-full">
              {total} total
            </span>
          </div>
        </div>

        <Link to="/workouts/new" className="btn-primary flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4">
          <Plus size={15} />
          <span>Log Workout</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card p-3 sm:p-4 space-y-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search exercises..."
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>
          
          {/* Action Row container for mobile styling alignment */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                showFilters || category !== "All" || difficulty !== "All"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              <Filter size={14} />
              <span>Filter</span>
            </button>
            
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="flex-1 sm:flex-initial bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer text-center sm:text-left"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">Category</p>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {["All", ...WORKOUT_CATEGORIES].map((c) => (
                      <button
                        key={c}
                        onClick={() => { setCategory(c); setPage(1); }}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-200 flex items-center gap-1 ${
                          category === c
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        {c !== "All" && CATEGORY_ICONS[c]} {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">Difficulty</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", ...DIFFICULTY_LEVELS].map((d) => (
                      <button
                        key={d}
                        onClick={() => { setDifficulty(d); setPage(1); }}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 flex-1 sm:flex-none text-center ${
                          difficulty === d
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Workout List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <WorkoutCardSkeleton key={i} />)}
        </div>
      ) : workouts.length === 0 ? (
        <EmptyState
          
          title="No workouts found"
          message={search || category !== "All" ? "Try adjusting your filters." : "Log your first workout to get started."}
          action={
            !search && category === "All" && (
              <Link to="/workouts/new" className="btn-primary inline-flex items-center gap-2 text-sm">
                <Plus size={14} /> Log First Workout
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {workouts.map((workout, i) => (
              <motion.div
                key={workout._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
              >
                <WorkoutCard
                  workout={workout}
                  onDelete={() => setDeleteTarget(workout._id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-all active:scale-95"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-medium text-slate-400">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-all active:scale-95"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Workout"
        message="This will permanently delete this workout. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function WorkoutCard({ workout, onDelete }) {
  const displayTimestamp = () => {
    const relative = formatRelativeDate(workout.date);
    if (workout.time) {
      return `${relative} • ${workout.time}`;
    }
    return relative;
  };

  // Safe string sanitization to prevent key lookup mismatch issues
  const exerciseKey = (workout.exercise || "").toLowerCase().trim();
  const matchedImageUrl = EXERCISE_IMAGES[exerciseKey] || EXERCISE_IMAGES["default"];

  return (
    <motion.div whileHover={{ scale: 1.002 }} className="glass-card border border-slate-800/60 p-3 sm:p-4 hover:border-slate-700/60 transition-all duration-200">
      <div className="flex items-start gap-2.5 sm:gap-3.5">
        
        {/* Dynamic Image Wrapper Container */}
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
          <img 
            src={matchedImageUrl} 
            alt={workout.exercise} 
            className="w-full h-full object-cover opacity-70 contrast-125 brightness-90 saturate-[85%] transition-opacity duration-200 hover:opacity-90"
            loading="lazy"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white tracking-wide truncate capitalize">{workout.exercise}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span>{workout.category}</span>
                <span className="hidden xs:inline w-1 h-1 rounded-full bg-slate-700" />
                <span className="text-slate-400">{displayTimestamp()}</span>
              </p>
            </div>
            
            <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border shrink-0 text-center ${DIFFICULTY_COLOR[workout.difficulty]}`}>
              {workout.difficulty}
            </span>
          </div>

          {/* Upgraded Flexible Grid Stat Badges/Chips */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            <StatChip label="Duration" value={formatDuration(workout.duration)} />
            {workout.caloriesBurned > 0 && <StatChip label="Calories" value={`${workout.caloriesBurned} kcal`} />}
            {workout.sets && <StatChip label="Sets" value={workout.sets} />}
            {workout.reps && <StatChip label="Reps" value={workout.reps} />}
            {workout.weight && <StatChip label="Weight" value={`${workout.weight} kg`} />}
          </div>

          {/* Dedicated Section for Notes */}
          {workout.notes && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/60">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Notes</span>
              <p className="text-xs text-slate-400 italic font-normal leading-relaxed break-words">"{workout.notes}"</p>
            </div>
          )}
        </div>

        {/* Floating Side Action Modifiers */}
        <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-1 shrink-0 self-start">
          <Link
            to={`/workouts/${workout._id}/edit`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
          >
            <Edit3 size={14} />
          </Link>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StatChip({ label, value }) {
  return (
    <div className="flex items-center gap-1 bg-slate-800/40 border border-slate-700/30 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px]">
      <span className="text-slate-500 font-medium">{label}:</span>
      <span className="text-slate-200 font-semibold">{value}</span>
    </div>
  );
}