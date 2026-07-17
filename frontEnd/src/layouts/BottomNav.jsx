import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Dumbbell, 
  BarChart3, 
  Menu, 
  X, 
  Activity, 
  User, 
  Settings 
} from "lucide-react";

const mainNavItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/workouts", icon: Dumbbell, label: "Workouts" },
  { to: "/progress", icon: BarChart3, label: "Progress" },
];

const drawerItems = [
  { to: "/bmi", icon: Activity, label: "BMI" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Slide-up Drawer Backdrop Overlay */}
      <div 
        onClick={() => setIsOpen(false)}
        className={`lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-up Drawer Container */}
      <div 
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/98 border-t border-slate-800/80 rounded-t-2xl p-5 pb-safe transition-transform duration-300 shadow-2xl ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between mb-5 px-1">
          <span className="text-xs font-bold tracking-widest text-emerald-500 uppercase">
            More Features
          </span>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content Links Grid Layout */}
        <div className="grid grid-cols-3 gap-y-5 gap-x-2 justify-items-center mb-16">
          {drawerItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 w-full max-w-[80px] text-center ${
                  isActive ? "text-emerald-400" : "text-slate-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2.5 rounded-xl transition-all duration-200 ${isActive ? "bg-emerald-500/10" : "bg-slate-900/50 border border-slate-800/40"}`}>
                    <item.icon size={20} />
                  </div>
                  <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Primary Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/60 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          
          {/* Main App Route Tabs */}
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[60px] ${
                  isActive && !isOpen
                    ? "text-emerald-400"
                    : "text-slate-500 hover:text-slate-300"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive && !isOpen ? "bg-emerald-500/10" : ""}`}>
                    <item.icon size={20} />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Interactive "More Options" Trigger Tab */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[60px] ${
              isOpen ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-all duration-200 ${isOpen ? "bg-emerald-500/10" : ""}`}>
              <Menu size={20} />
            </div>
            <span className="text-[10px] font-medium">More</span>
          </button>

        </div>
      </nav>
    </>
  );
}