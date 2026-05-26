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

export async function login(emailOrUser: string, password: string): Promise<boolean> {
  try {
    const email = emailOrUser.includes("@") ? emailOrUser : `${emailOrUser}@aris.com`;
    const res = await api.post<any>(
      "/auth/login",
      { email, password }
    );
    const token = res.data?.data?.token || res.data?.token;
    const user = res.data?.data?.user || res.data?.user;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem("aris_is_demo", "false");
      return true;
    }
    return false;
  } catch {
    // If API fails or rejects credentials, check fallback for admin/aris2026
    if (
      (emailOrUser === "admin" || emailOrUser === "admin@aris.com") &&
      password === "aris2026"
    ) {
      const demoUser: AuthUser = {
        id: "demo-user",
        name: "Demo Operator",
        email: "admin@aris.com",
        role: "admin",
      };
      localStorage.setItem(TOKEN_KEY, "demo-token-12345");
      localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
      localStorage.setItem("aris_is_demo", "true");
      return true;
    }
    return false;
  }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
