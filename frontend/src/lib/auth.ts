// ARIS Auth — JWT-backed authentication helpers
import { api } from "./api";

const TOKEN_KEY = "aris_token";
const USER_KEY  = "aris_user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "operator" | "viewer";
  phone?: string;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthed(): boolean {
  return !!getToken();
}

/** Call real backend; returns true on success */
export async function login(emailOrUser: string, password: string): Promise<boolean> {
  try {
    // Accept either email or the demo username "admin"
    const email = emailOrUser.includes("@") ? emailOrUser : `${emailOrUser}@aris.com`;
    const res = await api.post<{ success: boolean; data: { token: string; user: AuthUser } }>(
      "/auth/login",
      { email, password }
    );
    if (res.data.success) {
      localStorage.setItem(TOKEN_KEY, res.data.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.data.user));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
