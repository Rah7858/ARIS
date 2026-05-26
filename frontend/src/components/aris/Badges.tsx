import type { Severity, Status } from "@/lib/mock-data";

export function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, string> = {
    CRITICAL: "bg-danger/15 text-danger border-danger/40 shadow-[0_0_8px_rgba(255,45,45,0.4)]",
    HIGH: "bg-warning/15 text-warning border-warning/40",
    MEDIUM: "bg-cyan/15 text-cyan border-cyan/40",
    LOW: "bg-success/15 text-success border-success/40",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-display font-semibold tracking-[0.15em] border rounded-sm ${map[severity]}`}>
      {severity === "CRITICAL" && <span className="w-1.5 h-1.5 rounded-full bg-danger pulse-dot" />}
      {severity}
    </span>
  );
}

export function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    ACTIVE: "bg-danger/20 text-danger border-danger/50",
    RESPONDING: "bg-warning/20 text-warning border-warning/50",
    RESOLVED: "bg-success/15 text-success border-success/40",
    PENDING: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono-tech tracking-wider border rounded-full ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "ACTIVE" ? "bg-danger pulse-dot" : status === "RESPONDING" ? "bg-warning pulse-cyan" : status === "RESOLVED" ? "bg-success" : "bg-muted-foreground"}`} />
      {status}
    </span>
  );
}

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-danger/20 border border-danger/60 rounded-sm text-[10px] font-display font-bold tracking-[0.2em] text-danger backdrop-blur">
      <span className="w-1.5 h-1.5 rounded-full bg-danger pulse-dot" />
      LIVE
    </span>
  );
}
