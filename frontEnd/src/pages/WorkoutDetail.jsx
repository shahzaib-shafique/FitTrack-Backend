import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Edit3, Trash2, Flame, Clock, Repeat, Scale } from "lucide-react";
import toast from "react-hot-toast";
import { workoutService } from "../services/workoutService.js";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import { CATEGORY_ICONS, DIFFICULTY_COLOR, formatDuration, formatDate } from "../utils/helpers.js";

export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    workoutService.getOne(id)
      .then((data) => setWorkout(data.workout))
      .catch(() => { toast.error("Workout not found."); navigate("/workouts"); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      await workoutService.delete(id);
      toast.success("Workout deleted.");
      navigate("/workouts");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded-lg" />
        <div className="h-64 bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (!workout) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
          <ArrowLeft size={16} />
        </button>
        <div className="flex gap-2">
          <Link to={`/workouts/${id}/edit`} className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-all">
            <Edit3 size={16} />
          </Link>
          <button onClick={() => setShowDelete(true)} className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl">
            {CATEGORY_ICONS[workout.category]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{workout.exercise}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-slate-400">{workout.category}</span>
              <span className="text-slate-600">·</span>
              <span className="text-sm text-slate-400">{formatDate(workout.date)}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFFICULTY_COLOR[workout.difficulty]}`}>
                {workout.difficulty}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Clock, label: "Duration", value: formatDuration(workout.duration), color: "text-blue-400" },
            { icon: Flame, label: "Calories", value: `${workout.caloriesBurned || 0} kcal`, color: "text-orange-400" },
            { icon: Repeat, label: "Sets × Reps", value: workout.sets && workout.reps ? `${workout.sets} × ${workout.reps}` : "—", color: "text-emerald-400" },
            { icon: Scale, label: "Weight", value: workout.weight ? `${workout.weight} kg` : "—", color: "text-cyan-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-3 text-center">
              <stat.icon size={16} className={`${stat.color} mx-auto mb-1.5`} />
              <p className="text-base font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {workout.notes && (
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs font-medium text-slate-400 mb-1">Notes</p>
            <p className="text-sm text-slate-300">{workout.notes}</p>
          </div>
        )}
      </motion.div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Workout"
        message="This will permanently delete this workout."
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
