import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include uppercase letter")
    .regex(/[a-z]/, "Must include lowercase letter")
    .regex(/[0-9]/, "Must include number"),
});

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, loginWithGoogle } = useAuth();
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
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          const loginToast = toast.loading("Creating your secure account...");
          try {
            await loginWithGoogle(response.credential);
            toast.success("Account registered successfully!", { id: loginToast });
            navigate("/dashboard");
          } catch (err) {
            toast.error(err.message || "Registration failed.", { id: loginToast });
          }
        },
      });

      const container = document.getElementById("hiddenGoogleBtnContainerReg");
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
      await registerUser(data);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCustomGoogleLogin = () => {
    const nativeBtn = document.querySelector("#hiddenGoogleBtnContainerReg div[role=button]");
    if (nativeBtn) {
      nativeBtn.click();
    } else if (typeof google !== "undefined") {
      google.accounts.id.prompt();
    } else {
      toast.error("Google services are loading. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex overflow-x-hidden text-white antialiased">
      <div id="hiddenGoogleBtnContainerReg" className="hidden" />

      {/* Left panel - Screen structural toggle layer */}
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
            Begin Your
            <span className="block gradient-text">Fitness Journey</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-sm">
            Join thousands of athletes transforming their bodies and minds with FitTrack.
          </p>
        </motion.div>
      </div>

      {/* Right panel - Responsive fluid viewbox layout tracking */}
      <div className="w-full lg:w-1/2 flex items-center justify-center min-h-screen lg:min-h-0 p-4 sm:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md flex flex-col items-stretch py-4"
        >
          {/* Mobile responsive branded nav row */}
          <div className="flex lg:hidden items-center gap-2.5 mb-6 sm:mb-8 self-start">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">FitTrack</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 self-start tracking-tight">Create account</h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-6 sm:mb-8 self-start">Start your transformation today.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 w-full">
            <div>
              <label className="label text-xs font-semibold mb-1.5 block text-slate-400">Full name</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input {...register("name")} type="text" placeholder="FitTrack" className="input-field pl-10 py-3 text-sm sm:text-base" />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1.5 font-medium pl-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label text-xs font-semibold mb-1.5 block text-slate-400">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input {...register("email")} type="email" placeholder="you@example.com" className="input-field pl-10 py-3 text-sm sm:text-base" />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1.5 font-medium pl-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label text-xs font-semibold mb-1.5 block text-slate-400">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10 py-3 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1.5 font-medium pl-1">{errors.password.message}</p>}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-sm sm:text-base flex items-center justify-center gap-2 font-semibold transition-all mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Flexible block boundary splitter */}
          <div className="relative flex py-5 sm:py-6 items-center w-full">
            <div className="flex-grow border-t border-slate-800/80"></div>
            <span className="flex-shrink mx-3 text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest font-bold">
              Or continue with
            </span>
            <div className="flex-grow border-t border-slate-800/80"></div>
          </div>

          {/* Premium Dark Silver / Slate responsive action element wrapper */}
          <button
            type="button"
            onClick={handleCustomGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-slate-900 to-zinc-900 hover:from-slate-800 hover:to-zinc-800 border border-slate-800/60 hover:border-slate-700/60 text-zinc-200 font-semibold rounded-xl py-3 px-4 text-sm transition-all duration-200 shadow-xl shadow-black/40 cursor-pointer active:scale-[0.98]"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.054 14.98 0 12 0 7.354 0 3.307 2.667 1.297 6.56l3.969 3.205z" />
              <path fill="#34A853" d="M16.04 15.345c-1.077.732-2.483 1.164-4.04 1.164-2.927 0-5.414-1.982-6.299-4.654L1.711 15.04C3.766 19.045 7.9 21.818 12 21.818c3.273 0 6.04-.1 8.218-3.054l-4.178-3.419z" />
              <path fill="#4285F4" d="M23.49 12.273c0-.818-.082-1.609-.218-2.373H12v4.582h6.49c-.29 1.51-.127 2.791-2.45 3.282l4.178 3.419c2.44-2.255 3.272-5.573 3.272-8.91z" />
              <path fill="#FBBC05" d="M5.701 11.855a7.126 7.126 0 0 1 0-2.31L1.71 6.364a11.96 11.96 0 0 0 0 11.237l3.991-3.746z" />
            </svg>
            <span className="text-xs sm:text-sm">Continue with Google</span>
          </button>

          <p className="text-center text-slate-500 text-xs sm:text-sm mt-6 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors decoration-2">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}