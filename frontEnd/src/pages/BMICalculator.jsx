import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Info } from "lucide-react";
import { calculateBMI, getBMICategory } from "../utils/helpers.js";
import { useAuth } from "../context/AuthContext.jsx";
import { userService } from "../services/userService.js";
import toast from "react-hot-toast";

const BMI_RANGES = [
  { range: "< 18.5", label: "Underweight", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  { range: "18.5 – 24.9", label: "Normal Weight", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  { range: "25 – 29.9", label: "Overweight", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  { range: "≥ 30", label: "Obese", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
];

export default function BMICalculator() {
  const { user, updateUser } = useAuth();
  const [weight, setWeight] = useState(user?.weight?.toString() || "");
  const [height, setHeight] = useState(user?.height?.toString() || "");
  const [unit, setUnit] = useState("metric");
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const calculate = () => {
    let w = parseFloat(weight);
    let h = parseFloat(height);

    if (!w || !h || w <= 0 || h <= 0) {
      toast.error("Please enter valid weight and height.");
      return;
    }

    if (unit === "imperial") {
      w = w * 0.453592; // lbs to kg
      h = h * 2.54; // inches to cm
    }

    const bmi = calculateBMI(w, h);
    setResult({ bmi, ...getBMICategory(parseFloat(bmi)) });
  };

  const saveToProfile = async () => {
    let w = parseFloat(weight);
    let h = parseFloat(height);
    if (unit === "imperial") { w = w * 0.453592; h = h * 2.54; }

    setSaving(true);
    try {
      const data = await userService.updateProfile({ weight: w, height: h });
      updateUser({ weight: data.user.weight, height: data.user.height });
      toast.success("Saved to your profile!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">BMI Calculator</h1>
        <p className="text-slate-500 text-sm">Body Mass Index tracker</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-5">
        {/* Unit toggle */}
        <div className="flex bg-slate-800 rounded-xl p-1">
          {["metric", "imperial"].map((u) => (
            <button
              key={u}
              onClick={() => { setUnit(u); setResult(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                unit === u ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {u === "metric" ? "Metric (kg/cm)" : "Imperial (lbs/in)"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Weight ({unit === "metric" ? "kg" : "lbs"})</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={unit === "metric" ? "70" : "154"}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Height ({unit === "metric" ? "cm" : "in"})</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={unit === "metric" ? "175" : "69"}
              className="input-field"
            />
          </div>
        </div>

        <button onClick={calculate} className="btn-primary w-full flex items-center justify-center gap-2">
          <Calculator size={16} />
          Calculate BMI
        </button>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-6 text-center"
          >
            <p className="text-6xl font-black mb-2" style={{ color: "currentColor" }}>
              <span className={result.color}>{result.bmi}</span>
            </p>
            <p className={`text-lg font-semibold mb-1 ${result.color}`}>{result.label}</p>
            <p className="text-slate-400 text-sm mb-5">Your Body Mass Index</p>

            <button
              onClick={saveToProfile}
              disabled={saving}
              className="btn-secondary text-sm py-2 px-5 inline-flex items-center gap-2"
            >
              {saving ? <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" /> : null}
              Save to Profile
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reference chart */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Info size={14} className="text-slate-400" />
          BMI Reference
        </h3>
        <div className="space-y-2">
          {BMI_RANGES.map((range) => (
            <div key={range.label} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${range.bg}`}>
              <span className={`text-sm font-medium ${range.color}`}>{range.label}</span>
              <span className="text-xs text-slate-400">{range.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
