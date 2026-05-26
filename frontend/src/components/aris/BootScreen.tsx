import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

const BOOT_KEY = "aris_booted";

export function BootScreen() {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(BOOT_KEY) !== "1";
  });
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!show) return;
    let p = 0;
    const tick = window.setInterval(() => {
      p = Math.min(100, p + 4 + Math.random() * 8);
      setProgress(p);
      if (p >= 100) {
        window.clearInterval(tick);
        setTimeout(() => setFading(true), 250);
        setTimeout(() => {
          sessionStorage.setItem(BOOT_KEY, "1");
          setShow(false);
        }, 850);
      }
    }, 90);
    return () => window.clearInterval(tick);
  }, [show]);

  if (!show) return null;

  const lines = [
    "LOADING NEURAL DETECTION MODELS",
    "CONNECTING TO CAMERA NODES",
    "SYNCING EMERGENCY CHANNELS",
    "CALIBRATING RESPONSE GRID",
  ];
  const lineIdx = Math.min(lines.length - 1, Math.floor(progress / 26));

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#05070d] grid place-items-center transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage:
          "radial-gradient(circle at 30% 40%, rgba(0,229,255,0.18), transparent 55%), radial-gradient(circle at 70% 70%, rgba(255,45,45,0.12), transparent 55%)",
      }} />
      <div className="relative flex flex-col items-center gap-6 w-[min(90vw,420px)]">
        <div className="relative w-20 h-20 grid place-items-center rounded-sm border border-cyan/40 bg-cyan/5 glow-cyan">
          <ShieldAlert className="w-10 h-10 text-cyan" />
          <span className="absolute inset-0 border border-cyan/30 rounded-sm pulse-cyan" />
          <span className="absolute -inset-2 border border-cyan/10 rounded-sm pulse-cyan" style={{ animationDelay: "0.4s" }} />
        </div>

        <div className="text-center">
          <div className="font-display font-bold text-3xl tracking-[0.4em] glow-text-cyan text-cyan">ARIS</div>
          <div className="text-[10px] tracking-[0.3em] text-muted-foreground mt-1 font-display">
            ACCIDENT RESPONSE INTELLIGENCE SYSTEM
          </div>
        </div>

        <div className="w-full">
          <div className="flex justify-between text-[10px] font-mono-tech text-muted-foreground mb-1.5">
            <span className="text-cyan">INITIALIZING SYSTEM<span className="blink">...</span></span>
            <span className="text-cyan">{Math.floor(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-cyan/10 border border-cyan/20 overflow-hidden rounded-sm">
            <div
              className="h-full bg-gradient-to-r from-cyan/60 to-cyan transition-[width] duration-150 ease-out shadow-[0_0_10px_var(--cyan)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-[10px] font-mono-tech text-muted-foreground/80 tracking-wider">
            &gt; {lines[lineIdx]}<span className="caret" />
          </div>
        </div>

        <div className="text-[9px] font-mono-tech text-muted-foreground/60 tracking-[0.25em]">
          NODE IND-01 · TLS 1.3 · v2.4.1
        </div>
      </div>
    </div>
  );
}
