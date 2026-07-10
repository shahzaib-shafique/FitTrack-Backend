import axios from "axios";

const api = axios.create({
  baseURL: "/api",
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
