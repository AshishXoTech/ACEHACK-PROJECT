import axios, { AxiosError, AxiosInstance } from "axios";

const resolveApiBaseUrl = () => {
  const envBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envBase) return envBase;

  if (typeof window !== "undefined") {
    // In deployments (e.g. Vultr + reverse proxy), default to same-origin API path.
    return `${window.location.origin}/api`;
  }

  // Server-side fallback for local development.
  return "http://localhost:5001/api";
};

const API_BASE_URL = resolveApiBaseUrl();

export const ACCESS_TOKEN_KEY = "hackflow_ai_token";
export const CURRENT_USER_KEY = "hackflow_ai_user";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (
      typeof window !== "undefined" &&
      error.response &&
      error.response.status === 401
    ) {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(CURRENT_USER_KEY);
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
