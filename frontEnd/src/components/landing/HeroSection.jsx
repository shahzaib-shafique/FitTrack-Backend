import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-16">
      
      {/* Background Physical Premium Asset Image Overlay */}
      {/* Using dynamic background centering wrappers to guarantee 100% cross-device responsiveness */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none mix-blend-luminosity select-none">
        <img 
          src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=2000" 
          alt="Premium Dark Aesthetic Gym Environment" 
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-700"
          loading="eager"
        />
      </div>

      {/* Dynamic Theme Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-1" />
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-emerald/5 via-transparent to-brand-cyan/5 z-1" />

      {/* Decorative Glow elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
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