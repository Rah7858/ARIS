import { useEffect, useState } from "react";
import { AlertOctagon, X } from "lucide-react";

interface AlertItem { id: string; severity: string; location: string; }

let listeners: ((a: AlertItem) => void)[] = [];
export function emitAlert(a: AlertItem) { listeners.forEach(l => l(a)); }

export function AlertBanner() {
  const [alert, setAlert] = useState<AlertItem | null>(null);
  useEffect(() => {
    const fn = (a: AlertItem) => {
      setAlert(a);
      try {
        // Short alarm beep via WebAudio (no asset needed)
        const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (Ctx) {
          const ctx = new Ctx();
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.type = "square"; o.frequency.value = 880; g.gain.value = 0.05;
          o.connect(g); g.connect(ctx.destination); o.start();
          setTimeout(() => { o.frequency.value = 440; }, 150);
          setTimeout(() => { o.stop(); ctx.close(); }, 380);
        }
      } catch {}
      setTimeout(() => setAlert(null), 7000);
    };
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }, []);

  if (!alert) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 alarm-slam">
      <div className="bg-danger text-white px-4 py-3 flex items-center gap-3 alert-flash border-b-2 border-white/40">
        <AlertOctagon className="w-6 h-6 shrink-0 pulse-dot" />
        <div className="flex-1 flex items-center gap-3 text-sm font-display tracking-wider">
          <span className="px-2 py-0.5 bg-white/25 rounded-sm font-bold blink">⚠ NEW {alert.severity}</span>
          <span className="uppercase">Accident detected · {alert.location}</span>
          <span className="font-mono-tech text-xs opacity-90">ID {alert.id}</span>
        </div>
        <button onClick={() => setAlert(null)} className="opacity-80 hover:opacity-100"><X className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
