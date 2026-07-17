import { useLocation, Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { getInitials } from "../utils/helpers.js";

const PAGE_META = {
  "/dashboard":  { title: "Dashboard",        subtitle: "Welcome back" },
  "/workouts":   { title: "Workouts",          subtitle: "Track your training", },
  "/workouts/new": { title: "Log Workout",     subtitle: "Record a session" },
  "/progress":   { title: "Progress",          subtitle: "Your fitness journey" },
  "/calendar":   { title: "Calendar",          subtitle: "Plan your week" },
  "/water":      { title: "Hydration",         subtitle: "Stay hydrated" },
  "/bmi":        { title: "BMI Calculator",    subtitle: "Know your numbers" },
  "/profile":    { title: "Profile",           subtitle: "Your account" },
  "/settings":   { title: "Settings",          subtitle: "Preferences" },
};

export function Header() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Resolve meta — handle dynamic routes like /workouts/:id/edit
  let meta = PAGE_META[pathname];
  if (!meta) {
    if (pathname.endsWith("/edit")) meta = { title: "Edit Workout", subtitle: "Update details" };
    else if (pathname.startsWith("/workouts/")) meta = { title: "Workout Detail", subtitle: "Session info" };
    else meta = { title: "FitTrack", subtitle: "" };
  }

  const firstName = user?.name?.split(" ")[0] || "";

  return (
    <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-slate-800/60 px-4 sm:px-6 py-3.5">
      <div className="flex items-center justify-between gap-3">
        {/* Left: title */}
        <div className="min-w-0">
          <h2 className="text-base font-bold text-white leading-tight truncate">{meta.title}</h2>
          {meta.subtitle && (
            <p className="text-xs text-slate-500 leading-tight truncate">
              {meta.subtitle}{firstName ? `, ${firstName}` : ""}
            </p>
          )}
        </div>

        {/* Right: CTA + avatar */}
        <div className="flex items-center gap-2 shrink-0">
          {meta.cta && (
            <Link
              to={meta.cta.to}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white text-xs font-semibold rounded-xl px-3 py-2 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              <Plus size={13} />
              {meta.cta.label}
            </Link>
          )}
          <Link to="/profile">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
              {getInitials(user?.name)}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
