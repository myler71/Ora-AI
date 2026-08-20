import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

/** Turn a relative API path (e.g. `assets/predict/file.png`) into a full URL using `VITE_API_BASE_URL`. */
export function resolveApiMediaUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const base = API_BASE_URL.replace(/\/$/, "");
  const path = trimmed.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${base}/${path}`;
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.dispatchEvent(new Event("auth-changed"));
    }
    return Promise.reject(error);
  },
);
