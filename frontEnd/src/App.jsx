import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";
import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";
import { AppLayout } from "./layouts/AppLayout.jsx";

// Import your structural layouts from the layouts folder
import ProtectedRoute from "./layouts/ProtectedRoute.jsx";
import GuestRoute from "./layouts/GuestRoute.jsx";

// Pages
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Workouts from "./pages/Workouts.jsx";
import WorkoutForm from "./pages/WorkoutForm.jsx";
import WorkoutDetail from "./pages/WorkoutDetail.jsx";
import Progress from "./pages/Progress.jsx";
import BMICalculator from "./pages/BMICalculator.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";

function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Guest routes — Logged-in users automatically bounce away from these */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Redirects users explicitly trying to access layout paths without parameters */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/workouts/new" element={<WorkoutForm />} />
        <Route path="/workouts/:id" element={<WorkoutDetail />} />
        <Route path="/workouts/:id/edit" element={<WorkoutForm />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/bmi" element={<BMICalculator />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: "#0f172a",
                color: "#f1f5f9",
                border: "1px solid #1e293b",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: 500,
              },
              success: {
                iconTheme: { primary: "#10b981", secondary: "#0f172a" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#0f172a" },
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}