
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx"; 

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle } = useAuth(); 
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    /* global google */
    if (typeof google !== "undefined") {
      // 1. Initialize Google Identity Services
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          const loginToast = toast.loading("Verifying security token...");
          try {
            // response.credential is the 100% pure raw JWT string token your backend wants
            await loginWithGoogle(response.credential);
            toast.success("Welcome back!", { id: loginToast });
            navigate("/dashboard");
          } catch (err) {
            toast.error(err.message || "Backend verification failed.", { id: loginToast });
          }
        },
      });

      // 2. Pre-render the native button invisibly so it's ready to fire instantly on click #1
      const container = document.getElementById("hiddenGoogleBtnContainer");
      if (container) {
        google.accounts.id.renderButton(container, {
          type: "standard",
          theme: "dark",
        });
      }
    }
  }, [loginWithGoogle, navigate]);

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Invalid email or password.");
    }
  };

  // Instant execution on the first click
  const handleCustomGoogleLogin = () => {
    const nativeBtn = document.querySelector("#hiddenGoogleBtnContainer div[role=button]");
    if (nativeBtn) {
      nativeBtn.click();
    } else if (typeof google !== "undefined") {
      google.accounts.id.prompt();
    } else {
      toast.error("Google services are loading. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row overflow-x-hidden text-white">
      {/* Hidden container that holds the pre-rendered Google button */}
      <div id="hiddenGoogleBtnContainer" className="hidden" />

      {/* Left panel */}
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
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md flex flex-col justify-center"
        >
          <div className="flex lg:hidden items-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">FitTrack</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Sign in</h2>
          <p className="text-sm sm:text-base text-slate-400 mb-6 sm:mb-8">Welcome back — let's get moving.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
            <div>
              <label className="label text-xs sm:text-sm">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="input-field pl-10 text-sm sm:text-base"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label text-xs sm:text-sm">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
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

          <div className="relative flex py-4 sm:py-5 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest">
              Or continue with
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Premium Dark Silver / Slate Button */}
          <button
            type="button"
            onClick={handleCustomGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-slate-900 to-zinc-900 hover:from-slate-800 hover:to-zinc-800 border border-slate-800/80 hover:border-slate-700/80 text-zinc-200 font-medium rounded-xl py-3 px-4 text-sm transition-all duration-200 shadow-xl shadow-black/40 cursor-pointer"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.054 14.98 0 12 0 7.354 0 3.307 2.667 1.297 6.56l3.969 3.205z" />
              <path fill="#34A853" d="M16.04 15.345c-1.077.732-2.483 1.164-4.04 1.164-2.927 0-5.414-1.982-6.299-4.654L1.711 15.04C3.766 19.045 7.9 21.818 12 21.818c3.273 0 6.04-.1 8.218-3.054l-4.178-3.419z" />
              <path fill="#4285F4" d="M23.49 12.273c0-.818-.082-1.609-.218-2.373H12v4.582h6.49c-.29 1.51-.127 2.791-2.45 3.282l4.178 3.419c2.44-2.255 3.272-5.573 3.272-8.91z" />
              <path fill="#FBBC05" d="M5.701 11.855a7.126 7.126 0 0 1 0-2.31L1.71 6.364a11.96 11.96 0 0 0 0 11.237l3.991-3.746z" />
            </svg>
            Continue with Google
          </button>

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