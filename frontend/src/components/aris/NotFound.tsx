import { Link } from "@tanstack/react-router";
import { ShieldAlert, Radio, Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen relative overflow-hidden grid place-items-center px-4 bg-[#05070d]">
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(0,229,255,0.18), transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,45,45,0.18), transparent 50%)",
      }} />
      <div className="red-sweep" aria-hidden />

      <div className="absolute top-0 left-0 right-0 h-8 bg-danger/10 border-b border-danger/30 flex items-center justify-center text-[10px] font-display tracking-[0.4em] text-danger">
        <span className="pulse-cyan w-1.5 h-1.5 bg-danger rounded-full mr-2" />
        SIGNAL LOST · SECTOR UNREACHABLE
      </div>

      <div className="relative w-full max-w-lg slide-down">
        <div className="glass corner-brackets p-10 text-center relative">
          <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-danger to-transparent" />

          <div className="relative mx-auto w-16 h-16 grid place-items-center rounded-sm border border-danger/40 bg-danger/5 mb-4">
            <ShieldAlert className="w-8 h-8 text-danger" />
            <span className="absolute inset-0 border border-danger/30 rounded-sm pulse-cyan" />
          </div>

          <div className="font-display text-[6.5rem] leading-none font-bold text-danger glow-text-red tracking-[0.05em]">
            404
          </div>
          <div className="font-display tracking-[0.35em] text-cyan mt-2 text-[11px]">
            // SECTOR NOT FOUND
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm mx-auto">
            The coordinates you requested are not in the response grid. Telemetry has been logged.
            Return to command center to continue operations.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-mono-tech text-muted-foreground/80">
            <Radio className="w-3 h-3 text-danger pulse-cyan" />
            <span>ERR_GRID_MISS · TRACE 0x{Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0").toUpperCase()}</span>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 h-10 bg-cyan/15 hover:bg-cyan/25 border border-cyan/50 text-cyan font-display tracking-[0.25em] text-xs transition-all glow-cyan"
            >
              <Home className="w-3.5 h-3.5" /> RETURN TO COMMAND
            </Link>
            <button
              onClick={() => history.back()}
              className="inline-flex items-center gap-2 px-5 h-10 border border-border text-muted-foreground hover:text-foreground hover:border-cyan/40 font-display tracking-[0.25em] text-xs transition-all"
            >
              ◀ GO BACK
            </button>
          </div>
        </div>
        <div className="mt-3 text-center text-[10px] font-mono-tech text-muted-foreground">
          NODE: IND-01 · STATUS: ROUTE_UNRESOLVED · v2.4.1
        </div>
      </div>
    </div>
  );
}
