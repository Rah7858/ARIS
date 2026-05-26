import { useEffect, useState } from "react";
import { CheckCircle2, X, AlertCircle, Info } from "lucide-react";

type Variant = "success" | "error" | "info";
interface Toast { id: number; msg: string; variant: Variant; }

let id = 0;
let listeners: ((t: Toast) => void)[] = [];

export function toast(msg: string, variant: Variant = "info") {
  const t = { id: ++id, msg, variant };
  listeners.forEach(l => l(t));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    const fn = (t: Toast) => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 4000);
    };
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(t => {
        const Icon = t.variant === "success" ? CheckCircle2 : t.variant === "error" ? AlertCircle : Info;
        const color = t.variant === "success" ? "text-success border-success/40" : t.variant === "error" ? "text-danger border-danger/40" : "text-cyan border-cyan/40";
        return (
          <div key={t.id} className={`glass slide-down flex items-start gap-3 p-3 pr-8 min-w-[280px] relative border-l-2 ${color}`}>
            <Icon className={`w-4 h-4 mt-0.5 ${color.split(" ")[0]}`} />
            <div className="text-sm flex-1">{t.msg}</div>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
