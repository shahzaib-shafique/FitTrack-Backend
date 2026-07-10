import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getLast30Days } from "../../utils/helpers.js";
import { format } from "date-fns";

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs space-y-1">
        <p className="text-slate-400">{label}</p>
        <p className="text-emerald-400">{payload[0]?.value || 0} workouts</p>
        {payload[1] && <p className="text-cyan-400">{payload[1]?.value || 0} kcal</p>}
      </div>
    );
  }
  return null;
}

export function MonthlyProgressChart({ data }) {
  const last30 = getLast30Days();

  const chartData = last30
    .filter((_, i) => i % 3 === 0) // sample every 3 days to avoid crowding
    .map((dateStr) => {
      const entry = data.find((d) => d._id === dateStr);
      return {
        date: format(new Date(dateStr + "T00:00:00"), "MMM d"),
        workouts: entry ? entry.count : 0,
        calories: entry ? entry.calories : 0,
      };
    });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="workoutsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="caloriesMonthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis tick={{ fill: "#64748b", fontSize: 10 }} dataKey="date" axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="workouts"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#workoutsGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
