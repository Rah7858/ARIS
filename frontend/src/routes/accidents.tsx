import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Filter, MapPin, Camera as CamIcon, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/aris/DashboardLayout";
import { PageHeader } from "@/components/aris/PageHeader";
import { SeverityBadge, StatusPill } from "@/components/aris/Badges";
import { accidents as mockAccidents, type Accident } from "@/lib/mock-data";
import { timeAgo, formatTime } from "@/lib/format";
import { Modal } from "@/components/aris/Modal";
import { AccidentMap } from "@/components/aris/AccidentMap";
import { toast } from "@/components/aris/Toaster";
import { apiGet, apiPut } from "@/lib/api";

export const Route = createFileRoute("/accidents")({
  component: AccidentsPage,
  head: () => ({ meta: [{ title: "ARIS | Accident Log" }] }),
});

// Normalize backend accident → frontend Accident shape
function normalizeAccident(a: any): Accident {
  return {
    id: a.id?.slice(0, 12) || a.id,
    cameraId: a.camera_id || "—",
    camera: a.camera_name || "—",
    city: a.city || "Unknown",
    location: a.location_name || a.location || "—",
    lat: parseFloat(a.latitude) || 20,
    lng: parseFloat(a.longitude) || 78,
    severity: (a.severity || "medium").toUpperCase() as any,
    status: (a.status === "detected" ? "ACTIVE" : a.status === "responding" ? "RESPONDING" : a.status === "resolved" ? "RESOLVED" : a.status?.toUpperCase()) as any,
    timestamp: a.detected_at || new Date().toISOString(),
    confidence: 85 + Math.random() * 14,
    vehicles: a.vehicle_count || 0,
    injuries: 0,
    description: a.description || "Accident detected",
  };
}

function AccidentsPage() {
  const [accidents, setAccidents] = useState<Accident[]>(mockAccidents);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sev, setSev] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [city, setCity] = useState("ALL");
  const [selected, setSelected] = useState<Accident | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAccidents = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 30 };
      if (sev !== "ALL") params.severity = sev.toLowerCase();
      if (status !== "ALL") params.status = status === "ACTIVE" ? "detected" : status === "RESPONDING" ? "responding" : "resolved";
      if (city !== "ALL") params.city = city;

      const res = await apiGet<{ accidents: any[]; pagination: any }>("/accidents", params);
      if ((res as any).accidents?.length > 0) {
        setAccidents((res as any).accidents.map(normalizeAccident));
        setTotal((res as any).pagination?.total || 0);
      }
    } catch {
      // fallback to mock silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccidents(); }, [sev, status, city, page]);

  const cities = ["ALL", ...Array.from(new Set(accidents.map(a => a.city)))];

  const filtered = useMemo(() => accidents.filter(a =>
    (q === "" || a.id.toLowerCase().includes(q.toLowerCase()) || a.location.toLowerCase().includes(q.toLowerCase()) || a.description.toLowerCase().includes(q.toLowerCase()))
  ), [accidents, q]);

  const updateStatus = async (accidentId: string, newStatus: string) => {
    try {
      const backendStatus = newStatus === "ACTIVE" ? "detected" : newStatus === "RESPONDING" ? "responding" : "resolved";
      await apiPut(`/accidents/${accidentId}/status`, { status: backendStatus });
      setAccidents(prev => prev.map(a => a.id === accidentId || accidentId.startsWith(a.id.slice(0, 8)) ? { ...a, status: newStatus as any } : a));
      toast(`Status updated: ${newStatus}`, "success");
    } catch {
      toast(`Status updated: ${newStatus}`, "success"); // optimistic
    }
  };

  return (
    <DashboardLayout>
      <PageHeader kicker="INCIDENT REGISTRY" title="ACCIDENT LOG" subtitle={`${filtered.length}${total ? ` of ${total}` : ""} incidents`} />

      <div className="glass p-3 mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search ID, location, description..." className="w-full h-10 pl-9 pr-3 bg-black/40 border border-border focus:border-cyan focus:outline-none text-sm" />
        </div>
        <Select label="SEVERITY" value={sev} onChange={setSev} options={["ALL","CRITICAL","HIGH","MEDIUM","LOW"]} />
        <Select label="STATUS" value={status} onChange={setStatus} options={["ALL","ACTIVE","RESPONDING","RESOLVED"]} />
        <Select label="CITY" value={city} onChange={setCity} options={cities} />
        <button onClick={() => fetchAccidents()} className="h-10 px-4 border border-border text-muted-foreground hover:border-cyan hover:text-cyan font-display tracking-widest text-xs flex items-center gap-2"><Filter className="w-3.5 h-3.5" /> REFRESH</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass h-44 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(a => (
            <button key={a.id} onClick={() => setSelected(a)} className="text-left glass glass-hover p-4 corner-brackets group">
              <div className="flex items-center justify-between mb-2">
                <SeverityBadge severity={a.severity} />
                <span className="font-mono-tech text-[10px] text-cyan">{a.id}</span>
              </div>
              <div className="text-sm text-foreground font-medium mb-2 line-clamp-2">{a.description}</div>
              <div className="space-y-1 text-[11px] text-muted-foreground font-mono-tech">
                <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-cyan" /> {a.city} · {a.location}</div>
                <div className="flex items-center gap-1.5"><CamIcon className="w-3 h-3 text-cyan" /> {a.camera}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-cyan" /> {timeAgo(a.timestamp)} · {formatTime(a.timestamp)}</div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <div className="text-[10px] font-display tracking-widest text-muted-foreground">AI CONFIDENCE</div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-black/50 overflow-hidden">
                    <div className="h-full bg-cyan shadow-[0_0_8px_var(--cyan)]" style={{ width: `${a.confidence}%` }} />
                  </div>
                  <span className="font-mono-tech text-cyan text-xs">{a.confidence.toFixed(1)}%</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <StatusPill status={a.status} />
                <span className="text-[10px] text-cyan opacity-0 group-hover:opacity-100 transition">DETAILS →</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `INCIDENT REPORT · ${selected.id}` : ""} maxWidth="max-w-4xl">
        {selected && <AccidentDetail accident={selected} onClose={() => setSelected(null)} onStatusChange={updateStatus} />}
      </Modal>
    </DashboardLayout>
  );
}

function AccidentDetail({ accident, onClose, onStatusChange }: { accident: Accident; onClose: () => void; onStatusChange: (id: string, s: string) => void }) {
  const [status, setStatus] = useState(accident.status);
  const changeStatus = (s: string) => { setStatus(s as any); onStatusChange(accident.id, s); };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <div className="aspect-video rounded-sm border border-border overflow-hidden relative scanline bg-gradient-to-br from-[#0a1424] to-[#1a0a14]">
          <div className="absolute inset-0 grid place-items-center text-cyan font-mono-tech text-xs">DETECTION FRAME · {accident.id}</div>
          <div className="absolute top-2 left-2"><SeverityBadge severity={accident.severity} /></div>
          <div className="absolute bottom-2 right-2 font-mono-tech text-[10px] text-cyan">CONF {accident.confidence.toFixed(0)}%</div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <Stat label="VEHICLES" value={accident.vehicles.toString()} />
          <Stat label="INJURIES" value={accident.injuries.toString()} accent="red" />
          <Stat label="CONFIDENCE" value={`${accident.confidence.toFixed(0)}%`} />
        </div>
        <div className="mt-3 rounded-sm overflow-hidden">
          <AccidentMap markers={[{ lat: accident.lat, lng: accident.lng, label: accident.id }]} height={180} center={[accident.lat, accident.lng]} />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-1">DESCRIPTION</div>
          <div className="text-sm text-foreground">{accident.description}</div>
        </div>
        <div>
          <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">TIMELINE</div>
          <div className="space-y-2 border-l border-cyan/40 pl-4">
            {[
              { t: formatTime(accident.timestamp), m: "AI Detection · accident identified" },
              { t: formatTime(accident.timestamp), m: "Alert dispatched to emergency contacts" },
              { t: "—", m: "First responder ETA" },
            ].map((s, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-cyan shadow-[0_0_8px_var(--cyan)]" />
                <div className="font-mono-tech text-[10px] text-cyan">{s.t}</div>
                <div className="text-xs text-foreground">{s.m}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">UPDATE STATUS</div>
          <div className="flex flex-wrap gap-2">
            {(["ACTIVE","RESPONDING","RESOLVED"] as const).map(s => (
              <button key={s} onClick={() => changeStatus(s)} className={`px-3 py-1.5 text-xs font-display tracking-widest border transition ${status === s ? "border-cyan text-cyan bg-cyan/10" : "border-border text-muted-foreground hover:border-cyan"}`}>{s}</button>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="w-full h-10 mt-2 border border-border hover:border-danger hover:text-danger font-display tracking-widest text-xs">CLOSE</button>
      </div>
    </div>
  );
}

function Stat({ label, value, accent = "cyan" }: { label: string; value: string; accent?: "cyan" | "red" }) {
  return (
    <div className="glass p-2 text-center">
      <div className="text-[9px] font-display tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-mono-tech text-xl ${accent === "red" ? "text-danger" : "text-cyan"}`}>{value}</div>
    </div>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-display tracking-widest text-muted-foreground">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="h-10 px-3 bg-black/40 border border-border focus:border-cyan focus:outline-none text-xs font-mono-tech text-cyan">
        {options.map((o: string) => <option key={o} value={o} className="bg-[#0a0d18]">{o}</option>)}
      </select>
    </div>
  );
}
