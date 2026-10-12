import axios from "axios";

/**
 * Axios instance pre-configured to talk to the backend API.
 * Uses Vite's proxy so no CORS issues in dev.
 */
const api = axios.create({
  baseURL: "/",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for global error normalization
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export default api;
