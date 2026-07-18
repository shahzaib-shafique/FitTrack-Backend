import { Link } from "react-router-dom";

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-gray-950 py-12 relative z-10 text-gray-500 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Logo Brand Frame */}
          <div className="flex items-center space-x-1">
            <span className="text-lg font-black text-white tracking-tight">
              Fit<span className="bg-gradient-to-r from-brand-emerald to-brand-cyan bg-clip-text text-transparent">Track</span>
            </span>
          </div>

          {/* Legal / Metadata links */}
          <div className="flex space-x-6 text-gray-400">
            <a href="#privacy" className="hover:text-white transition-colors duration-150">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-white transition-colors duration-150">
              Terms of Service
            </a>
          </div>

          {/* Copyright signature */}
          <div className="text-gray-600 text-xs text-center sm:text-right">
            &copy; {currentYear} FitTrack Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}