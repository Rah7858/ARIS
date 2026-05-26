import { useCountUp } from "@/hooks/use-count-up";
import type { ReactNode } from "react";

interface Props {
  label: string;
  value: number;
  suffix?: string;
  trend?: string;
  trendUp?: boolean;
  accent?: "cyan" | "red" | "success" | "warning";
  icon?: ReactNode;
  decimals?: number;
}

const accentMap = {
  cyan: { text: "text-cyan", bar: "bg-cyan", glow: "shadow-[0_0_30px_rgba(0,229,255,0.15)]" },
  red: { text: "text-danger", bar: "bg-danger", glow: "shadow-[0_0_30px_rgba(255,45,45,0.2)]" },
  success: { text: "text-success", bar: "bg-success", glow: "shadow-[0_0_30px_rgba(0,255,135,0.15)]" },
  warning: { text: "text-warning", bar: "bg-warning", glow: "shadow-[0_0_30px_rgba(255,184,0,0.15)]" },
} as const;

export function StatCard({ label, value, suffix = "", trend, trendUp, accent = "cyan", icon, decimals = 0 }: Props) {
  const v = useCountUp(value);
  const a = accentMap[accent];
  return (
    <div className={`glass corner-brackets p-5 relative overflow-hidden glass-hover ${a.glow}`}>
      <div className={`absolute top-0 left-0 h-[2px] w-full ${a.bar} opacity-70`} />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-display font-medium">{label}</div>
          <div className={`mt-2 font-mono-tech text-4xl ${a.text}`} style={{ textShadow: `0 0 16px currentColor` }}>
            {v.toFixed(decimals)}{suffix}
          </div>
          {trend && (
            <div className={`mt-2 text-xs font-mono-tech ${trendUp ? "text-success" : "text-danger"}`}>
              {trendUp ? "▲" : "▼"} {trend}
            </div>
          )}
        </div>
        <div className={`${a.text} opacity-70`}>{icon}</div>
      </div>
    </div>
  );
}
