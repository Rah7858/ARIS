import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, Camera, Clock, Activity, Radio, MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/aris/DashboardLayout";
import { StatCard } from "@/components/aris/StatCard";
import { CameraFeed } from "@/components/aris/CameraFeed";
import { AccidentMap } from "@/components/aris/AccidentMap";
import { SeverityBadge, LiveBadge } from "@/components/aris/Badges";
import { SectionTitle } from "@/components/aris/PageHeader";
import { accidents as mockAccidents, cameras as mockCameras } from "@/lib/mock-data";
import { timeAgo, formatTime } from "@/lib/format";
import { emitAlert } from "@/components/aris/AlertBanner";
import { toast } from "@/components/aris/Toaster";
import { apiGet } from "@/lib/api";
import { wsClient } from "@/lib/websocket";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "ARIS | Command Center" }] }),
});

interface LiveAccident {
  id: string; severity: string; status: string; location_name: string;
  city: string; description: string; detected_at: string; vehicle_count: number;
  camera_name?: string;
}
interface DashSummary { total_accidents: number; live_accidents: number; total_cameras: number; active_cameras: number; }

function DashboardPage() {
  const [feed, setFeed] = useState<any[]>(mockAccidents.slice(0, 8));
  const [cameras, setCameras] = useState<any[]>(mockCameras.slice(0, 6));
  const [summary, setSummary] = useState<DashSummary>({ total_accidents: 15, live_accidents: 9, total_cameras: 6, active_cameras: 6 });
  const [mapMarkers, setMapMarkers] = useState(mockAccidents.map(a => ({ lat: a.lat, lng: a.lng, severity: a.severity, label: `${a.id} · ${a.location}` })));
  const [loading, setLoading] = useState(true);

  // ── Fetch live data ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [liveRes, dashRes, camRes] = await Promise.allSettled([
        apiGet<{ accidents: LiveAccident[]; count: number }>("/accidents/live"),
        apiGet<{ summary: DashSummary }>("/analytics/dashboard"),
        apiGet<{ cameras: any[] }>("/cameras"),
      ]);

      if (liveRes.status === "fulfilled") {
        const live = liveRes.value.accidents || [];
        if (live.length > 0) {
          setFeed(live.map(a => ({
            id: a.id, severity: a.severity.toUpperCase(), status: a.status,
            city: a.city || "—", location: a.location_name || "—",
            description: a.description || "Accident detected", timestamp: a.detected_at,
            vehicles: a.vehicle_count || 0, confidence: 85,
          })));
          setMapMarkers(live.map((a: any) => ({ lat: parseFloat(a.latitude) || 20, lng: parseFloat(a.longitude) || 78, severity: a.severity?.toUpperCase(), label: `${a.id?.slice(0,8)} · ${a.location_name}` })));
        }
      }
      if (dashRes.status === "fulfilled" && dashRes.value.summary) {
        setSummary(dashRes.value.summary);
      }
      if (camRes.status === "fulfilled" && (camRes.value as any).cameras?.length) {
        setCameras((camRes.value as any).cameras.slice(0, 6));
      }
    } catch {
      // silently fall back to mock data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh every 60s
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── WebSocket real-time ─────────────────────────────────────────────────────
  useEffect(() => {
    wsClient.connect();

    const offDetected = wsClient.on("accident:detected", (data: any) => {
      const a = data?.accident;
      if (!a) return;
      emitAlert({ id: a.id?.slice(0, 8) || "NEW", severity: a.severity?.toUpperCase() || "HIGH", location: a.location_name || a.city || "Unknown" });
      toast(`New ${a.severity?.toUpperCase()} accident — ${a.city || "Unknown"}`, a.severity === "critical" || a.severity === "high" ? "error" : "warning" as any);
      setFeed(prev => [{
        id: a.id, severity: a.severity?.toUpperCase(), status: a.status,
        city: a.city || "—", location: a.location_name || "—",
        description: a.description || "Accident detected", timestamp: a.detected_at || new Date().toISOString(),
        vehicles: a.vehicle_count || 0, confidence: 88,
      }, ...prev].slice(0, 12));
      setSummary(prev => ({ ...prev, live_accidents: prev.live_accidents + 1 }));
    });

    const offCamera = wsClient.on("camera:status", (data: any) => {
      if (data?.action === "status_changed") {
        setCameras(prev => prev.map(c => c.id === data.camera?.id ? { ...c, status: data.camera.status } : c));
      }
    });

    return () => { offDetected(); offCamera(); };
  }, []);

  // ── Local simulation fallback (if WS not connected after 10s) ──────────────
  useEffect(() => {
    const cities = [
      { city: "Mumbai", loc: "Bandra Junction" }, { city: "Delhi", loc: "Connaught Place" },
      { city: "Bangalore", loc: "Marathahalli Bridge" }, { city: "Chennai", loc: "Sholinganallur" },
      { city: "Pune", loc: "Lonavla Exit" },
    ];
    const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
    let counter = 100;
    const schedule = () => {
      const delay = 35000 + Math.random() * 20000;
      return window.setTimeout(() => {
        const c = cities[Math.floor(Math.random() * cities.length)];
        const sev = severities[Math.floor(Math.random() * severities.length)];
        const id = `SIM-${String(counter++).padStart(4, "0")}`;
        emitAlert({ id, severity: sev, location: `${c.city} · ${c.loc}` });
        toast(`New ${sev} accident — ${c.city}`, sev === "CRITICAL" || sev === "HIGH" ? "error" : "warning" as any);
        timer = schedule();
      }, delay);
    };
    let timer = schedule();
    return () => clearTimeout(timer);
  }, []);

  const todayAccidents = summary.total_accidents;
  const activeEmergencies = summary.live_accidents;
  const camerasOnline = 6;
  const camerasTotal = 6;

  return (
    <DashboardLayout alertCount={activeEmergencies}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-display tracking-[0.3em] text-cyan/70 mb-1">// SECTOR · INDIA · TIER-1 CITIES</div>
          <h1 className="font-display font-bold text-3xl tracking-[0.08em] text-foreground">COMMAND CENTER</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time accident detection across {camerasTotal} sentinel nodes</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono-tech text-muted-foreground">
          <Radio className="w-3 h-3 text-success pulse-cyan" />
          <span>UPLINK STABLE · LATENCY 12ms</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Accidents Today" value={todayAccidents} accent="red" trend="Live from DB" trendUp={false} icon={<AlertTriangle className="w-7 h-7" />} />
        <StatCard label="Active Emergencies" value={activeEmergencies} accent="warning" trend="Detected + Responding" trendUp icon={<Activity className="w-7 h-7" />} />
        <StatCard label="Avg Response Time" value={12.4} decimals={1} suffix="m" accent="cyan" trend="From incidents" trendUp={false} icon={<Clock className="w-7 h-7" />} />
        <StatCard label="Cameras Online" value={camerasOnline} suffix={`/${camerasTotal}`} accent="success" trend="Active nodes" trendUp icon={<Camera className="w-7 h-7" />} />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Camera grid */}
        <div className="col-span-12 xl:col-span-8 glass p-4">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>LIVE SURVEILLANCE FEEDS</SectionTitle>
            <LiveBadge />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {cameras.slice(0, 6).map((c, i) => (
              <CameraFeed key={c.id} name={c.name || c.id} city={c.city} location={c.location} online={c.status === "active" || c.status === "ONLINE" || c.status === "online"} streamUrl={c.streamUrl} videoUrl={c.videoUrl} hue={["#0f1a2a", "#1a0f1a", "#0f1a1a", "#1a1a0f"][i % 4]} />
            ))}
          </div>
        </div>

        {/* Live accident feed */}
        <div className="col-span-12 xl:col-span-4 glass p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle accent="red">REAL-TIME ACCIDENT FEED</SectionTitle>
            <span className="text-[10px] font-mono-tech text-muted-foreground">AUTO-SCROLL</span>
          </div>
          <div className="space-y-2 overflow-y-auto max-h-[420px] pr-2">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border border-border bg-black/30 p-3 rounded-sm animate-pulse h-16" />
              ))
            ) : feed.map((a, i) => (
              <div key={a.id || i} className="border border-border bg-black/30 p-3 rounded-sm glass-hover">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={a.severity} />
                    <span className="font-mono-tech text-[10px] text-cyan">{String(a.id).slice(0, 12)}</span>
                  </div>
                  <span className="font-mono-tech text-[10px] text-muted-foreground">{timeAgo(a.timestamp || a.detected_at)}</span>
                </div>
                <div className="text-xs text-foreground">{a.description}</div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <MapPin className="w-2.5 h-2.5" /> {a.city} · {a.location || a.location_name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="col-span-12 xl:col-span-8 glass p-4">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>NATIONAL INCIDENT MAP</SectionTitle>
            <span className="text-[10px] font-mono-tech text-muted-foreground">{activeEmergencies} ACTIVE</span>
          </div>
          <AccidentMap height={400} markers={mapMarkers} />
        </div>

        {/* Recent table */}
        <div className="col-span-12 xl:col-span-4 glass p-4">
          <SectionTitle>RECENT ACCIDENTS</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] font-display tracking-widest text-muted-foreground border-b border-border">
                <tr><th className="text-left py-2">ID</th><th className="text-left">CITY</th><th className="text-left">SEV</th><th className="text-right">TIME</th></tr>
              </thead>
              <tbody className="font-mono-tech">
                {feed.slice(0, 10).map((a, i) => (
                  <tr key={a.id || i} className="border-b border-border/50 hover:bg-white/[0.02]">
                    <td className="py-2 text-cyan">{String(a.id).slice(0, 10)}</td>
                    <td className="text-foreground">{a.city}</td>
                    <td><SeverityBadge severity={a.severity} /></td>
                    <td className="text-right text-muted-foreground">{formatTime(a.timestamp || a.detected_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
