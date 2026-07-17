import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator } from "lucide-react";
import { calculateBMI, getBMICategory } from "../utils/helpers.js";
import { useAuth } from "../context/AuthContext.jsx";
import { userService } from "../services/userService.js";
import toast from "react-hot-toast";

const BMI_RANGES = [
  { label: "Underweight", range: "< 18.5", color: "text-blue-400" },
  { label: "Normal", range: "18.5 – 24.9", color: "text-emerald-400" },
  { label: "Overweight", range: "25 – 29.9", color: "text-amber-400" },
  { label: "Obese", range: "≥ 30", color: "text-red-400" },
];

export default function BMICalculator() {
  const { user, updateUser } = useAuth();
  
  // Initialize as empty strings so fields always show placeholders on every fresh load
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState("metric");
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // Keep track of the computed metrics for saving even after inputs reset
  const [calculatedMetrics, setCalculatedMetrics] = useState(null);

  const calculate = () => {
    let w = parseFloat(weight);
    let h = parseFloat(height);

    if (!w || !h || w <= 0 || h <= 0) {
      toast.error("Please enter valid weight and height.");
      return;
    }

    let processedW = w;
    let processedH = h;

    if (unit === "imperial") {
      processedW = w * 0.453592;
      processedH = h * 2.54;
    }

    const bmi = calculateBMI(processedW, processedH);
    const categoryInfo = getBMICategory(parseFloat(bmi));
    
    const newResult = { bmi, ...categoryInfo };
    setResult(newResult);
    
    // Cache the absolute metric data values used for the profile update request
    setCalculatedMetrics({ weight: processedW, height: processedH });

    // Clear input state immediately after calculation to reveal the placeholders again
    setWeight("");
    setHeight("");
  };

  const saveToProfile = async () => {
    if (!calculatedMetrics) return;

    setSaving(true);
    try {
      const data = await userService.updateProfile({ 
        weight: calculatedMetrics.weight, 
        height: calculatedMetrics.height 
      });
      updateUser({ weight: data.user.weight, height: data.user.height });
      toast.success("Saved to your profile!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getNeedlePosition = (bmiValue) => {
    const numericBmi = parseFloat(bmiValue);
    if (!numericBmi) return 50; 
    if (numericBmi <= 15) return 0;
    if (numericBmi >= 35) return 100;
    return ((numericBmi - 15) / (35 - 15)) * 100;
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto mt-2 px-2 sm:px-0">
      <div className="px-1">
        <p className="text-xs text-slate-500 font-medium">Calculate and monitor your Body Mass Index</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
        {/* Unit toggle */}
        <div className="flex bg-slate-900/80 rounded-xl p-1 border border-slate-800/40">
          {["metric", "imperial"].map((u) => (
            <button
              key={u}
              onClick={() => { setUnit(u); setResult(null); setCalculatedMetrics(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                unit === u ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-white"
              }`}
            >
              {u === "metric" ? "Metric (kg/cm)" : "Imperial (lbs/in)"}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label text-slate-400">Weight ({unit === "metric" ? "kg" : "lbs"})</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={unit === "metric" ? "70" : "154"}
              className="input-field bg-slate-900/50"
            />
          </div>
          <div>
            <label className="label text-slate-400">Height ({unit === "metric" ? "cm" : "in"})</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={unit === "metric" ? "175" : "69"}
              className="input-field bg-slate-900/50"
            />
          </div>
        </div>

        <button onClick={calculate} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 font-semibold text-sm">
          <Calculator size={15} />
          Calculate BMI
        </button>
      </motion.div>

      {/* Permanently Visible Result Block */}
      <div className="glass-card p-5 space-y-6 overflow-hidden min-h-[258px] flex flex-col justify-between">
        
        {/* Live Indicator Section */}
        <div className="relative pt-12 pb-2">
          <div className="absolute inset-x-0 top-0 h-12 pointer-events-none">
            <motion.div 
              className="absolute top-0 flex flex-col items-center -translate-x-1/2 whitespace-nowrap"
              initial={{ left: "50%" }}
              animate={{ left: `${getNeedlePosition(result?.bmi)}%` }}
              transition={{ type: "spring", stiffness: 70, damping: 16 }}
            >
              <span className={`text-2xl font-black tracking-tight ${result ? result.color : "text-slate-600"}`}>
                {result ? result.bmi : "0.0"}
              </span>
              <div className="w-1.5 h-1.5 rotate-45 bg-slate-500" />
            </motion.div>
          </div>

          {/* Color Scale Strip */}
          <div className="h-1.5 w-full rounded-full flex overflow-hidden bg-slate-900">
            <div className="w-[17.5%] bg-blue-500/70" />
            <div className="w-[32.5%] bg-emerald-500/70" />
            <div className="w-[25%] bg-amber-500/70" />
            <div className="w-[25%] bg-red-500/70" />
          </div>
        </div>

        {/* Static Minimal Guide Label Strip */}
        <div className="grid grid-cols-4 gap-1 text-center border-t border-slate-900 pt-4">
          {BMI_RANGES.map((range) => {
            const isActive = result ? result.label.toLowerCase().includes(range.label.toLowerCase().split(" ")[0]) : false;
            return (
              <div key={range.label} className={`transition-opacity duration-300 ${isActive ? "opacity-100 scale-105" : "opacity-25"}`}>
                <p className={`text-[10px] font-bold ${range.color}`}>{range.label}</p>
                <p className="text-[9px] text-slate-500 font-medium mt-0.5">{range.range}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom Workspace Action Slot */}
        <div className="h-11 flex items-center justify-center pt-2">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.button
                key="save-btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={saveToProfile}
                disabled={saving}
                className="btn-secondary text-xs font-semibold py-2 px-6 rounded-xl inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 w-auto"
              >
                {saving && <div className="w-3.5 h-3.5 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />}
                Save to Profile
              </motion.button>
            ) : (
              <motion.p 
                key="placeholder-text"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="text-center text-[11px] text-slate-500 font-medium tracking-wide"
              >
                Enter your height and weight above to calculate your BMI.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}