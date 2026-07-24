import axios from "axios";

// Dynamically fetch the API URL, defaulting to "/api" so Vercel rewrites handle it seamlessly.
// For local development, you can create a .env file with VITE_API_URL=http://localhost:8000/api
const BASE_URL =
  import.meta.env?.VITE_API_URL ||
  process.env?.REACT_APP_API_URL ||
  "/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send httpOnly cookies with every request
  headers: { "Content-Type": "application/json" },
});

// Response interceptor — normalise errors and handle session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      "Something went wrong.";

    // Session expired — redirect to login (only for non-auth routes to avoid loops)
    if (
      status === 401 &&
      !error.config?.url?.includes("/auth/login") &&
      !error.config?.url?.includes("/auth/register") &&
      !error.config?.url?.includes("/auth/me")
    ) {
      // Use replace so back-button doesn't loop
      window.location.replace("/login");
    }

    return Promise.reject(new Error(message));
  }
);

export default api;