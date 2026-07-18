import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LandingNavbar from "../components/landing/LandingNavbar.jsx";
import HeroSection from "../components/landing/HeroSection.jsx";
import FeaturesSection from "../components/landing/FeaturesSection.jsx";
import CTASection from "../components/landing/CTASection.jsx";
import LandingFooter from "../components/landing/LandingFooter.jsx";

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Condition met: If user session exists, route directly to internal workspace
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  // Show a sleek loading background matching your app layout while checking status
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-xl font-medium animate-pulse text-emerald-400">
          Loading FitTrack...
        </div>
      </div>
    );
  }

  // Render landing experience safely if no authenticated user session exists
  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-brand-cyan/30 selection:text-white overflow-x-hidden antialiased">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}