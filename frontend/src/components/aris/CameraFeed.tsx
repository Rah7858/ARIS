import { useEffect, useMemo, useState } from "react";
import { LiveBadge } from "./Badges";

interface Props {
  name: string;
  city: string;
  location: string;
  online?: boolean;
  hue?: string;
  streamUrl?: string;
  videoUrl?: string;
}

export function CameraFeed({ name, city, location, online = true, hue = "#0f1a2a", streamUrl, videoUrl }: Props) {
  const particles = useMemo(() => Array.from({ length: 14 }).map((_, i) => ({
    left: (i * 17) % 100,
    top: (i * 29) % 100,
    dx: (i % 2 === 0 ? 1 : -1) * (40 + (i * 7) % 80),
    dy: -20 - (i * 5) % 50,
    dur: 4 + (i % 5),
    delay: (i * 0.4) % 5,
  })), []);
  const [bw, setBw] = useState(2.4);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const b = setInterval(() => setBw(1.8 + Math.random() * 2.4), 1200);
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => { clearInterval(b); clearInterval(t); };
  }, []);

  return (
    <div className="relative aspect-video rounded-sm overflow-hidden border border-border bg-black scanline group">
      {/* Looping video when online, fallback to radial gradient when offline */}
      {online ? (
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          style={{ zIndex: 0 }}
        >
          <source src={videoUrl || streamUrl || "https://cdn.pixabay.com/video/2020/07/30/46114-446449784_large.mp4"} type="video/mp4"/>
        </video>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 30% 40%, ${hue} 0%, #02040a 70%), linear-gradient(180deg, #050810 0%, #0a1424 100%)`,
            zIndex: 0
          }}
        />
      )}
      
      {/* Scanline / Grid overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          animation: "scanline 8s linear infinite",
          zIndex: 5
        }}
      />

      {/* Fake road / vehicles */}
      <div className="absolute bottom-1/3 left-0 right-0 h-px bg-cyan/40" style={{ zIndex: 5 }} />
      <div className="absolute top-1/3 left-0 right-0 h-px bg-cyan/20" style={{ zIndex: 5 }} />
      <div
        className="absolute bottom-[35%] left-1/4 w-3 h-2 bg-warning/80 rounded-sm shadow-[0_0_8px_var(--warning)]"
        style={{ animation: "scanline 6s linear infinite", zIndex: 5 }}
      />
      <div
        className="absolute bottom-[42%] right-1/3 w-2 h-1.5 bg-cyan/60 rounded-sm"
        style={{ animation: "scanline 9s linear infinite reverse", zIndex: 5 }}
      />

      {/* Drifting AI tracking particles */}
      {particles.map((p, i) => (
        <span key={i} className="cam-particle" style={{
          left: `${p.left}%`, top: `${p.top}%`,
          ["--dx" as any]: `${p.dx}px`, ["--dy" as any]: `${p.dy}px`,
          ["--dur" as any]: `${p.dur}s`, animationDelay: `${p.delay}s`,
          zIndex: 5
        }} />
      ))}

      {/* HUD overlay */}
      <div 
        className="absolute inset-0 p-2.5 flex flex-col justify-between text-[10px] font-mono-tech text-cyan/90"
        style={{ zIndex: 10 }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">CAM</span>
              <span className="text-cyan">{name}</span>
            </div>
            <div className="text-muted-foreground/80">{city.toUpperCase()} · {location}</div>
          </div>
          {online ? <LiveBadge /> : (
            <span className="px-2 py-0.5 border border-warning/50 text-warning text-[10px] font-display tracking-widest rounded-sm">OFFLINE</span>
          )}
        </div>
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground/70 blink">● REC</div>
            <div className="flex items-center gap-1.5 text-cyan/80">
              <span className="text-muted-foreground/70">BW</span>
              <span className="font-mono-tech">{bw.toFixed(2)} MB/s</span>
              <span className="w-10 h-1 bg-black/60 overflow-hidden">
                <span className="block h-full bg-cyan shadow-[0_0_6px_var(--cyan)]" style={{ width: `${Math.min(100, (bw/4.5)*100)}%` }} />
              </span>
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <div className="text-cyan/80">{now.toLocaleTimeString("en-GB")}</div>
            <div className="text-muted-foreground">4K · 30FPS</div>
          </div>
        </div>
      </div>

      {/* Corner brackets */}
      <span className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-cyan" style={{ zIndex: 10 }} />
      <span className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-cyan" style={{ zIndex: 10 }} />
      <span className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-cyan" style={{ zIndex: 10 }} />
      <span className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-cyan" style={{ zIndex: 10 }} />
    </div>
  );
}
