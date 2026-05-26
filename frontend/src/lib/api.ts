import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL 
  || 'http://localhost:5000'

// Dynamically resolve base API route to handle backend versioning
const BASE_URL = API_URL.includes('/api/v1')
  ? API_URL
  : API_URL.endsWith('/api')
    ? `${API_URL}/v1`
    : `${API_URL}/api/v1`

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('aris_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Convenience helpers to prevent breaking other components ─────────────────
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

export default api
