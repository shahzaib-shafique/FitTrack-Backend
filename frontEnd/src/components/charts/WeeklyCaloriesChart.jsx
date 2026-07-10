import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getLast7Days } from "../../utils/helpers.js";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-emerald-400 font-semibold">{payload[0].value} kcal</p>
      </div>
    );
  }
  return null;
}

export function WeeklyCaloriesChart({ data }) {
  const last7 = getLast7Days();

  const chartData = last7.map((dateStr) => {
    const entry = data.find((d) => d._id === dateStr);
    const dayIndex = new Date(dateStr + "T00:00:00").getDay();
    return {
      day: DAY_LABELS[dayIndex],
      calories: entry ? entry.calories : 0,
      count: entry ? entry.count : 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="calories" radius={[6, 6, 0, 0]} fill="url(#caloriesGradient)" />
        <defs>
          <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.6} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
