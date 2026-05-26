// ARIS API Client — axios instance with auth interceptors
import axios from "axios";

const BASE_URL = (import.meta.env?.VITE_API_URL) || "/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("aris_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 → redirect to login ─────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("aris_token");
        localStorage.removeItem("aris_user");
        window.location.href = "/login";
      }
    }
    const msg = error.response?.data?.message || error.message || "API error";
    console.error(`[ARIS API] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${msg}`);
    return Promise.reject(error);
  }
);

// ── Convenience helpers ───────────────────────────────────────────────────────
export const apiGet = <T>(url: string, params?: object) =>
  api.get<{ success: boolean; data: T }>(url, { params }).then((r) => r.data.data);

export const apiPost = <T>(url: string, body?: object) =>
  api.post<{ success: boolean; data: T; message?: string }>(url, body).then((r) => r.data);

export const apiPut = <T>(url: string, body?: object) =>
  api.put<{ success: boolean; data: T }>(url, body).then((r) => r.data.data);

export const apiPatch = <T>(url: string, body?: object) =>
  api.patch<{ success: boolean; data: T }>(url, body).then((r) => r.data.data);

export const apiDelete = (url: string) =>
  api.delete<{ success: boolean }>(url).then((r) => r.data);
