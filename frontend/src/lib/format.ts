export function timeAgo(iso: string): string {
  if (!iso) return "just now";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "just now";
  const d = (Date.now() - t) / 1000;
  if (d < 5) return "just now";
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  const days = Math.floor(d / 86400);
  if (days > 365) return "just now"; // sentinel for bad seed timestamps
  return `${days}d ago`;
}

export function formatTime(iso: string): string {
  if (!iso) return "--:--:--";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "--:--:--";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export function formatDate(iso: string): string {
  if (!iso) return "--";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "--";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
