import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, kicker, right }: { title: string; subtitle?: string; kicker?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        {kicker && (
          <div className="text-[10px] font-display tracking-[0.3em] text-cyan/70 mb-1">// {kicker}</div>
        )}
        <h1 className="font-display font-bold text-3xl tracking-[0.08em] glow-text-cyan text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function SectionTitle({ children, accent = "cyan" }: { children: ReactNode; accent?: "cyan" | "red" }) {
  const color = accent === "red" ? "text-danger" : "text-cyan";
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={`inline-block w-1 h-3 ${accent === "red" ? "bg-danger" : "bg-cyan"}`} />
      <h3 className={`font-display tracking-[0.2em] text-xs ${color}`}>{children}</h3>
    </div>
  );
}
