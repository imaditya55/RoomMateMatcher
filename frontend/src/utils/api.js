import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto logout on auth errors (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    // Only auto-logout on 401 (unauthorized). 403 can be a valid
    // business-logic response (e.g. "not connected", "not authorized").
    if (status === 401) {
      localStorage.removeItem("token");
      // Force a clean reset so protected routes immediately lock
      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
