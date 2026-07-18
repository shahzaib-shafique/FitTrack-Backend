import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-16">
      
      {/* Background Physical Premium Asset Image Overlay */}
      <div className="absolute inset-0 z-0 opacity-45 pointer-events-none mix-blend-luminosity">
        <img 
          src="https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcQYQjLEaWkKF-0Fc_23oymvhBiNn7fWQKUbP84LKJicyFUKLTmU73my6HrARs4kNEMNHKGFRqk5vjCxdfs" 
          alt="Premium Dark Aesthetic Gym Environment" 
          className="w-full h-full object-cover object-center scale-105"
        />
      </div>

      {/* Dynamic Theme Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-1" />
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-emerald/5 via-transparent to-brand-cyan/5 z-1" />

      {/* Decorative Glow elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Micro-badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900/80 border border-gray-800 backdrop-blur-xs text-xs font-medium text-gray-300 mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
          The Ultimate Training Interface
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1]"
        >
          Track Every Rep.<br />
          <span className="bg-gradient-to-r from-brand-emerald via-brand-cyan to-brand-blue bg-clip-text text-transparent">
            Transform Every Day.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Build strength, stay consistent, and achieve your fitness goals with FitTrack. Designed explicitly for elite execution.
        </motion.p>

        {/* CTA Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0"
        >
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-emerald to-brand-cyan text-black font-semibold rounded-xl shadow-xl shadow-brand-cyan/10 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-850 text-white font-medium rounded-xl border border-gray-800 hover:border-gray-750 transition-all duration-200 text-center"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    </section>
  );
}