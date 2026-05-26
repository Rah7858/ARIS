import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ open, onClose, title, children, maxWidth = "max-w-2xl" }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; maxWidth?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className={`glass relative w-full ${maxWidth} max-h-[90vh] overflow-auto corner-brackets`} onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0a0d18]/95 backdrop-blur border-b border-border px-5 py-3 flex items-center justify-between">
          <h3 className="font-display tracking-[0.2em] text-cyan text-sm">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-danger transition"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
