import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, SortAsc, Trash2, Edit3, ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workout Log</h1>
          <p className="text-slate-500 text-sm">{total} total workouts</p>
        </div>
        <Link to="/workouts/new" className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
          <Plus size={15} />
          <span className="hidden sm:inline">Log Workout</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search exercises..."
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
              showFilters || category !== "All" || difficulty !== "All"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            <Filter size={14} />
            <span className="hidden sm:inline">Filter</span>
          </button>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-3">
                <div>
                  <p className="text-xs text-slate-500 mb-2">Category</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", ...WORKOUT_CATEGORIES].map((c) => (
                      <button
                        key={c}
                        onClick={() => { setCategory(c); setPage(1); }}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
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
                  <p className="text-xs text-slate-500 mb-2">Difficulty</p>
                  <div className="flex gap-1.5">
                    {["All", ...DIFFICULTY_LEVELS].map((d) => (
                      <button
                        key={d}
                        onClick={() => { setDifficulty(d); setPage(1); }}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
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
          {[...Array(5)].map((_, i) => <WorkoutCardSkeleton key={i} />)}
        </div>
      ) : workouts.length === 0 ? (
        <EmptyState
          icon="🏋️"
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
                transition={{ delay: i * 0.05 }}
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
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-slate-400">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-all"
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
  return (
    <motion.div whileHover={{ scale: 1.005 }} className="glass-card-hover p-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0">
          {CATEGORY_ICONS[workout.category] || "🏋️"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="text-sm font-semibold text-white">{workout.exercise}</h3>
              <p className="text-xs text-slate-500">{workout.category} · {formatRelativeDate(workout.date)}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${DIFFICULTY_COLOR[workout.difficulty]}`}>
              {workout.difficulty}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <Stat label="Duration" value={formatDuration(workout.duration)} />
            {workout.caloriesBurned > 0 && <Stat label="Calories" value={`${workout.caloriesBurned} kcal`} />}
            {workout.sets && <Stat label="Sets" value={workout.sets} />}
            {workout.reps && <Stat label="Reps" value={workout.reps} />}
            {workout.weight && <Stat label="Weight" value={`${workout.weight} kg`} />}
          </div>

          {workout.notes && (
            <p className="text-xs text-slate-500 mt-2 italic truncate">"{workout.notes}"</p>
          )}
        </div>

        <div className="flex gap-1 shrink-0">
          <Link
            to={`/workouts/${workout._id}/edit`}
            className="p-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200"
          >
            <Edit3 size={14} />
          </Link>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-500">{label}:</span>
      <span className="text-xs text-slate-300 font-medium">{value}</span>
    </div>
  );
}
