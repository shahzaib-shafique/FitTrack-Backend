import { motion } from "framer-motion";

export default function FeaturesSection() {
  const features = [
    {
      title: "Workout Tracking",
      description: "Track workouts with ease and precision. Log weights, custom parameters, and sets seamlessly inside a distraction-free environment.",
      icon: (
        <svg className="w-6 h-6 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      title: "Progress Analytics",
      description: "Visualize improvements over time. Monitor your dynamic benchmarks and training metrics via accurate dashboard telemetry.",
      icon: (
        <svg className="w-6 h-6 text-brand-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      title: "Stay Consistent",
      description: "Build habits and reach your goals. Form systematic metrics and training records designed to retain momentum long-term.",
      icon: (
        <svg className="w-6 h-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="py-24 bg-black relative z-10 border-t border-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-semibold tracking-widest bg-gradient-to-r from-brand-emerald to-brand-cyan bg-clip-text text-transparent">
            Engineered Core Features
          </h2>
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything required to manifest physical performance.
          </p>
        </div>

        {/* Feature Cards Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 rounded-2xl bg-[#111827] border border-gray-900 hover:border-gray-800 transition-all duration-300 relative overflow-hidden"
            >
              {/* Card Accent Top Line Indicator Gradient */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-emerald to-brand-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mb-6 border border-gray-900 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}