import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // Path pointing to src/context/AuthContext

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // 1. While checking the cookie with the server, show a clean loader
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-xl font-medium animate-pulse text-emerald-400">
          Loading FitTrack...
        </div>
      </div>
    );
  }

  // 2. If the user isn't authenticated, send them straight to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If authenticated, allow them into the route layout
  return children;
}