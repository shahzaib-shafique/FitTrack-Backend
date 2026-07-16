import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, Mail, Lock, ArrowRight } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx"; // Hooked to central state

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle } = useAuth(); // <-- Destructured loginWithGoogle
  const navigate = useNavigate();

  // Container ref to dynamically track available layout space
  const containerRef = useRef(null);
  const [googleBtnWidth, setGoogleBtnWidth] = useState(320);

  // Measure and adjust width to perfectly fit any viewport size
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Apply comfortable horizontal padding for the Google iframe
        const calculatedWidth = containerWidth - 16; 
        
        // Google's button has a hard API limit of 200px (min) and 400px (max)
        const optimalWidth = Math.max(200, Math.min(calculatedWidth, 400));
        setGoogleBtnWidth(optimalWidth);
      }
    };

    // Initialize layout observer
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Invalid email or password.");
    }
  };

  // CLEANED: Dispatched directly to Context with proper loading feedback
  const handleGoogleSuccess = async (credentialResponse) => {
    const loginToast = toast.loading("Verifying security credentials...");
    try {
      const { credential } = credentialResponse;
      
      // Handle the verification state machine inside your clean React architecture
      await loginWithGoogle(credential);
      
      toast.success("Logged in with Google successfully!", { id: loginToast });
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err.message || "Google sign-in failed. Please try again.",
        { id: loginToast }
      );
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row overflow-x-hidden">
      {/* Left panel — Decorative Desktop Panel (Hidden on Mobile/Tablet) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-blue-500/5" />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30">
            <Zap size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 leading-tight">
            Track Every
            <span className="block gradient-text">Rep & Set</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-sm">
            Your premium fitness companion for achieving goals and breaking limits.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { value: "10K+", label: "Workouts" },
              { value: "500+", label: "Exercises" },
              { value: "98%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4">
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — Adaptive Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md flex flex-col justify-center"
          ref={containerRef}
        >
          {/* Mobile Header Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">FitTrack</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Sign in</h2>
          <p className="text-sm sm:text-base text-slate-400 mb-6 sm:mb-8">Welcome back — let's get moving.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
            {/* Email Field */}
            <div>
              <label className="label text-xs sm:text-sm">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input-field pl-10 text-sm sm:text-base"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="label text-xs sm:text-sm">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            {/* Manual Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-sm sm:text-base flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Form Divider */}
          <div className="relative flex py-4 sm:py-5 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest">
              Or continue with
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Secure, Auto-scaling Google Button Wrapper */}
          <div className="flex justify-center w-full rounded-xl overflow-hidden shadow-md">
            <GoogleLogin
              key={googleBtnWidth} 
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google authentication failed.")}
              theme="filled_black" 
              shape="pill"        
              size="large"
              width={`${googleBtnWidth}px`} 
              useOneTap           
            />
          </div>

          <p className="text-center text-slate-500 text-xs sm:text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}