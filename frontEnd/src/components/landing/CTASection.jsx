import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-24 bg-black relative overflow-hidden z-10 border-t border-gray-950">
      {/* Background Subtle Gradient Shape */}
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-emerald/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-b from-gray-950 to-[#111827] border border-gray-900 p-8 sm:p-16 rounded-3xl"
        >
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to start your fitness journey?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-400 max-w-xl mx-auto">
            Create your free account today. Sync parameters, evaluate data points, and achieve metrics safely.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 font-semibold text-black bg-gradient-to-r from-brand-emerald to-brand-cyan hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-xl shadow-xl shadow-brand-emerald/5 block text-center"
            >
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}