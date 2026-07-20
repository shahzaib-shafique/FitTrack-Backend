import React from 'react';

export default function AboutSection() {
  return (
    <section id="about" className="bg-black text-white py-24 px-6 md:px-12 relative overflow-hidden border-t border-slate-900">
      {/* Background ambient glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header / Manifesto */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-semibold tracking-widest text-emerald-400 uppercase mb-3">
            Our Mission
          </h2>
          <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent leading-tight">
            We didn't build another tracking app. We engineered a <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">performance framework.</span>
          </h3>
          <p className="mt-6 text-lg text-slate-400 font-normal leading-relaxed">
            FitTrack was born out of frustration with bloated fitness apps filled with social feeds, ads, and complex menus. We stripped away the noise to build a blazing-fast, data-rich ecosystem for serious lifters.
          </p>
        </div>

        {/* Pillars Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-950 to-black border border-slate-800/60 hover:border-brand-cyan/30 transition-colors duration-300">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-slate-100 mb-2">Absolute Precision</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              No guesswork. Track every single metric, custom rep scheme, and volume delta with zero computational latency.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-950 to-black border border-slate-800/60 hover:border-emerald-400/30 transition-colors duration-300">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-slate-100 mb-2">Data Integrity</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your workouts, weights, and health statistics belong exclusively to you. Full internal end-to-end sandbox privacy.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-950 to-black border border-slate-800/60 hover:border-cyan-400/30 transition-colors duration-300">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-slate-100 mb-2">Zero-Friction Engine</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Designed dynamically to let you log a complex progressive overload set in under three seconds flat. Keep training, stop tap-tapping.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}