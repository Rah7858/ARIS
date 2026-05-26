import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { isAuthed } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthed()) {
      navigate({ to: "/login", replace: true });
    }
  }, [navigate]);

  if (typeof window !== "undefined" && !isAuthed()) {
    return null; // prevent flash of content before redirect
  }

  return <>{children}</>;
}
