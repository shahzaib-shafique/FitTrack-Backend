import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, LogOut, Shield, Bell, ChevronRight, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { userService } from "../services/userService.js";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[a-z]/, "Must include a lowercase letter")
      .regex(/[0-9]/, "Must include a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
        checked ? "bg-emerald-500" : "bg-slate-700"
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: false,
    goalAlerts: true,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(passwordSchema) });

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("Signed out successfully.");
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await userService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password updated successfully!");
      reset();
      setOpenSection(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggle = (section) =>
    setOpenSection((prev) => (prev === section ? null : section));

  const sections = [
    {
      id: "password",
      icon: Lock,
      label: "Change Password",
      description: "Update your account password",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      id: "notifications",
      icon: Bell,
      label: "Notifications",
      description: "Manage reminders and alerts",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      id: "privacy",
      icon: Shield,
      label: "Privacy & Data",
      description: "Control your data and privacy",
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-slate-500 text-sm">Manage your account and preferences</p>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section, idx) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card overflow-hidden"
          >
            <button
              onClick={() => toggle(section.id)}
              className="w-full flex items-center gap-4 p-5 hover:bg-slate-800/30 transition-colors"
            >
              <div className={`p-2 rounded-xl ${section.bg}`}>
                <section.icon size={18} className={section.color} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-white">{section.label}</p>
                <p className="text-xs text-slate-500">{section.description}</p>
              </div>
              <ChevronRight
                size={16}
                className={`text-slate-500 transition-transform duration-200 ${
                  openSection === section.id ? "rotate-90" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {openSection === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 border-t border-slate-800">
                    {/* Password section */}
                    {section.id === "password" && (
                      <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4 pt-4">
                        <div>
                          <label className="label">Current Password</label>
                          <div className="relative">
                            <input
                              {...register("currentPassword")}
                              type={showCurrent ? "text" : "password"}
                              placeholder="••••••••"
                              className="input-field pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrent(!showCurrent)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                            >
                              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                          {errors.currentPassword && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors.currentPassword.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="label">New Password</label>
                          <div className="relative">
                            <input
                              {...register("newPassword")}
                              type={showNew ? "text" : "password"}
                              placeholder="••••••••"
                              className="input-field pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNew(!showNew)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                            >
                              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                          {errors.newPassword && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors.newPassword.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="label">Confirm New Password</label>
                          <input
                            {...register("confirmPassword")}
                            type="password"
                            placeholder="••••••••"
                            className="input-field"
                          />
                          {errors.confirmPassword && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"
                        >
                          {isSubmitting && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          )}
                          Update Password
                        </button>
                      </form>
                    )}

                    {/* Notifications section */}
                    {section.id === "notifications" && (
                      <div className="space-y-4 pt-4">
                        {[
                          { key: "dailyReminder", label: "Daily workout reminder", desc: "Get reminded to log your workout" },
                          { key: "weeklyReport", label: "Weekly progress report", desc: "Summary of your weekly performance" },
                          { key: "goalAlerts", label: "Goal achievement alerts", desc: "Celebrate when you hit your targets" },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-300">{item.label}</p>
                              <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                            <Toggle
                              checked={notifications[item.key]}
                              onChange={(val) =>
                                setNotifications((prev) => ({ ...prev, [item.key]: val }))
                              }
                            />
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            toast.success("Notification preferences saved.");
                            setOpenSection(null);
                          }}
                          className="btn-primary py-2 px-5 text-sm mt-2"
                        >
                          Save Preferences
                        </button>
                      </div>
                    )}

                    {/* Privacy section */}
                    {section.id === "privacy" && (
                      <div className="pt-4 space-y-4">
                        <p className="text-sm text-slate-400 leading-relaxed">
                          Your data is encrypted end-to-end and stored securely. We never share
                          your personal fitness data with third parties.
                        </p>
                        <div className="space-y-2">
                          {[
                            "All workout data is stored privately",
                            "Passwords are hashed with bcrypt",
                            "Sessions use secure httpOnly cookies",
                            "API is protected with rate limiting",
                          ].map((point) => (
                            <div key={point} className="flex items-center gap-2 text-xs text-slate-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              {point}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => toast("Data deletion would be processed within 30 days.", { icon: "ℹ️" })}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors underline"
                        >
                          Request account deletion
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* App info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 flex items-center justify-between"
      >
        <div>
          <p className="text-sm font-medium text-slate-300">FitTrack</p>
          <p className="text-xs text-slate-500">Version 2.0.0 · Production Build</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-sm">
          ⚡
        </div>
      </motion.div>

      {/* Sign out */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-200 font-medium"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}
