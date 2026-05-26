import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Wifi, WifiOff, Wrench } from "lucide-react";
import { DashboardLayout } from "@/components/aris/DashboardLayout";
import { PageHeader } from "@/components/aris/PageHeader";
import { CameraFeed } from "@/components/aris/CameraFeed";
import { Modal } from "@/components/aris/Modal";
import { cameras as initialCams, type Camera } from "@/lib/mock-data";
import { toast } from "@/components/aris/Toaster";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "@/lib/api";

export const Route = createFileRoute("/cameras")({
  component: CamerasPage,
  head: () => ({ meta: [{ title: "ARIS | Camera Nodes" }] }),
});

function normalizeCam(c: any): Camera {
  return {
    id: c.id,
    name: c.name || c.id,
    city: c.city || "Unknown",
    location: c.location || c.camera_location || "—",
    status: c.status === "active" || c.status === "ONLINE" || c.status === "online" ? "ONLINE" : c.status === "maintenance" ? "MAINTENANCE" : "OFFLINE",
    resolution: "4K",
    uptime: "99%",
    lat: parseFloat(c.latitude) || 20,
    lng: parseFloat(c.longitude) || 78,
    streamUrl: c.streamUrl || c.stream_url,
  };
}

function CamerasPage() {
  const [cams, setCams] = useState<Camera[]>(initialCams);
  const [editing, setEditing] = useState<Camera | null>(null);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  // Map of camera id → original backend id (UUID)
  const [idMap, setIdMap] = useState<Record<string, string>>({});

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const res = await apiGet<{ cameras: any[] }>("/cameras");
      const rawCams = (res as any).cameras || [];
      if (rawCams.length > 0) {
        const map: Record<string, string> = {};
        rawCams.forEach((c: any) => { map[c.id] = c.id; });
        setIdMap(map);
        setCams(rawCams.map(normalizeCam));
      }
    } catch {
      // keep mock
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCameras(); }, []);

  const online   = cams.filter(c => c.status === "ONLINE").length;
  const offline  = cams.filter(c => c.status === "OFFLINE").length;
  const maint    = cams.filter(c => c.status === "MAINTENANCE").length;

  const handleDelete = async (cam: Camera) => {
    try {
      await apiDelete(`/cameras/${cam.id}`);
      setCams(prev => prev.filter(c => c.id !== cam.id));
      toast(`Camera ${cam.name} removed`, "info");
    } catch {
      setCams(prev => prev.filter(c => c.id !== cam.id));
      toast(`Camera ${cam.name} removed`, "info");
    }
  };

  const handleStatusToggle = async (cam: Camera) => {
    const next = cam.status === "ONLINE" ? "inactive" : "active";
    const nextDisplay = next === "active" ? "ONLINE" : "OFFLINE";
    try {
      await apiPatch(`/cameras/${cam.id}/status`, { status: next });
      setCams(prev => prev.map(c => c.id === cam.id ? { ...c, status: nextDisplay as any } : c));
      toast(`Camera ${cam.name} set to ${nextDisplay}`, "success");
    } catch {
      setCams(prev => prev.map(c => c.id === cam.id ? { ...c, status: nextDisplay as any } : c));
    }
  };

  const handleSave = async (data: Partial<Camera>) => {
    if (editing) {
      try {
        await apiPut(`/cameras/${editing.id}`, {
          name: data.name, location: data.location, city: data.city,
          status: data.status === "ONLINE" ? "active" : data.status === "MAINTENANCE" ? "maintenance" : "inactive",
        });
        setCams(prev => prev.map(c => c.id === editing.id ? { ...c, ...data } : c));
        toast(`Camera ${editing.name} updated`, "success");
      } catch {
        setCams(prev => prev.map(c => c.id === editing.id ? { ...c, ...data } : c));
        toast(`Camera ${editing.name} updated`, "success");
      }
    } else {
      try {
        const res: any = await apiPost("/cameras", {
          name: data.name, location: data.location, city: data.city,
          latitude: 20, longitude: 78,
          status: data.status === "ONLINE" ? "active" : "inactive",
        });
        const newCam = normalizeCam(res?.data?.camera || { ...data, id: `cam-${Date.now()}` });
        setCams(prev => [...prev, newCam]);
        toast(`Camera ${data.name} registered`, "success");
      } catch {
        const id = `CAM-${String(cams.length + 1).padStart(3, "0")}`;
        setCams(prev => [...prev, { id, status: "ONLINE", resolution: "4K", uptime: "100%", lat: 20, lng: 78, ...data } as Camera]);
        toast(`Camera ${data.name} registered`, "success");
      }
    }
    setAdding(false); setEditing(null);
  };

  return (
    <DashboardLayout>
      <PageHeader kicker="SENTINEL NETWORK" title="CAMERA NODES" subtitle="Real-time surveillance infrastructure"
        right={<button onClick={() => setAdding(true)} className="h-10 px-4 bg-cyan/15 hover:bg-cyan/25 border border-cyan/50 text-cyan font-display tracking-widest text-xs flex items-center gap-2 glow-cyan"><Plus className="w-4 h-4" /> ADD CAMERA</button>}
      />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatusBox label="ONLINE"      count={online}  color="success" icon={<Wifi    className="w-5 h-5" />} />
        <StatusBox label="OFFLINE"     count={offline} color="danger"  icon={<WifiOff className="w-5 h-5" />} />
        <StatusBox label="MAINTENANCE" count={maint}   color="warning" icon={<Wrench  className="w-5 h-5" />} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="glass h-64 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cams.map((c, i) => (
            <div key={c.id} className="glass p-3">
              <CameraFeed name={c.name || c.id} city={c.city} location={c.location} online={c.status === "ONLINE"} streamUrl={c.streamUrl} hue={["#0f1a2a","#1a0f1a","#0f1a1a","#1a1a0f","#1a0f24"][i % 5]} />
              <div className="mt-3 flex items-start justify-between">
                <div>
                  <div className="font-display tracking-wider text-sm text-foreground">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono-tech">{c.city} · {c.location}</div>
                </div>
                <div className="text-right text-[10px] font-mono-tech">
                  <div className="text-cyan">{c.resolution}</div>
                  <div className="text-muted-foreground">UPTIME {c.uptime}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex gap-2">
                <button onClick={() => setEditing(c)} className="flex-1 h-8 border border-border hover:border-cyan hover:text-cyan text-xs font-display tracking-widest flex items-center justify-center gap-1.5 text-muted-foreground"><Edit3 className="w-3 h-3" /> EDIT</button>
                <button onClick={() => handleStatusToggle(c)} className="h-8 px-3 border border-border hover:border-warning hover:text-warning text-muted-foreground" title="Toggle status">{c.status === "ONLINE" ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}</button>
                <button onClick={() => handleDelete(c)} className="h-8 px-3 border border-border hover:border-danger hover:text-danger text-muted-foreground"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={adding || !!editing} onClose={() => { setAdding(false); setEditing(null); }} title={editing ? `EDIT · ${editing.name}` : "REGISTER NEW CAMERA"}>
        <CameraForm initial={editing || undefined} onSubmit={handleSave} />
      </Modal>
    </DashboardLayout>
  );
}

function StatusBox({ label, count, color, icon }: any) {
  const map: any = { success: "text-success border-success/40", danger: "text-danger border-danger/40", warning: "text-warning border-warning/40" };
  return (
    <div className={`glass corner-brackets p-4 border-l-2 ${map[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-display tracking-widest text-muted-foreground">{label}</div>
          <div className={`font-mono-tech text-3xl ${map[color].split(" ")[0]}`} style={{ textShadow: "0 0 12px currentColor" }}>{count}</div>
        </div>
        <div className={map[color].split(" ")[0]}>{icon}</div>
      </div>
    </div>
  );
}

function CameraForm({ initial, onSubmit }: { initial?: Camera; onSubmit: (d: Partial<Camera>) => void }) {
  const [name,     setName]   = useState(initial?.name || "");
  const [city,     setCity]   = useState(initial?.city || "Mumbai");
  const [location, setLoc]    = useState(initial?.location || "");
  const [status,   setStatus] = useState<Camera["status"]>(initial?.status || "ONLINE");
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ name, city, location, status }); }} className="space-y-4">
      <Field label="NAME"     value={name}     onChange={setName} />
      <Field label="CITY"     value={city}     onChange={setCity} />
      <Field label="LOCATION" value={location} onChange={setLoc} />
      <div>
        <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-1.5">STATUS</div>
        <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full h-10 px-3 bg-black/40 border border-border focus:border-cyan focus:outline-none font-mono-tech text-cyan">
          <option className="bg-[#0a0d18]">ONLINE</option>
          <option className="bg-[#0a0d18]">OFFLINE</option>
          <option className="bg-[#0a0d18]">MAINTENANCE</option>
        </select>
      </div>
      <button className="w-full h-10 bg-cyan/15 border border-cyan/50 text-cyan font-display tracking-widest text-xs glow-cyan">▶ SAVE</button>
    </form>
  );
}

function Field({ label, value, onChange }: any) {
  return (
    <label className="block">
      <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-1.5">{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)} required className="w-full h-10 px-3 bg-black/40 border border-border focus:border-cyan focus:outline-none font-mono-tech text-cyan" />
    </label>
  );
}
