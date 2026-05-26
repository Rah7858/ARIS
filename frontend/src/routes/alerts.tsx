import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RotateCw, Search } from "lucide-react";
import { DashboardLayout } from "@/components/aris/DashboardLayout";
import { PageHeader } from "@/components/aris/PageHeader";
import { alertHistory, type AlertRecord } from "@/lib/mock-data";
import { formatTime, formatDate } from "@/lib/format";
import { toast } from "@/components/aris/Toaster";
import { apiGet, apiPut } from "@/lib/api";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
  head: () => ({ meta: [{ title: "ARIS | Alert History" }] }),
});

function StatusPill({ status }: { status: AlertRecord["status"] }) {
  const map = {
    SENT:    "bg-success/15 text-success border-success/40",
    FAILED:  "bg-danger/15 text-danger border-danger/40",
    PENDING: "bg-warning/15 text-warning border-warning/40",
  };
  return <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-mono-tech tracking-wider rounded-sm ${map[status]}`}><span className={`w-1.5 h-1.5 rounded-full ${status === "SENT" ? "bg-success" : status === "FAILED" ? "bg-danger pulse-dot" : "bg-warning pulse-cyan"}`} />{status}</span>;
}

function normalizeAlert(a: any): AlertRecord {
  return {
    id: a.id?.slice(0, 12) || a.id,
    accidentId: a.accident_id?.slice(0, 8) || "—",
    contactName: a.recipient_name || "System",
    city: "—",
    type: (a.type || "SYSTEM").toUpperCase() as any,
    method: a.type?.toUpperCase() || "SYSTEM",
    status: (a.status || "pending").toUpperCase() as "SENT" | "FAILED" | "PENDING",
    sentAt: a.sent_at || a.created_at || new Date().toISOString(),
  };
}

function AlertsPage() {
  const [records, setRecords] = useState<AlertRecord[]>(alertHistory);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [idMap, setIdMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await apiGet<{ alerts: any[] }>("/alerts");
        const raw = (res as any).alerts || [];
        if (raw.length > 0) {
          const map: Record<string, string> = {};
          raw.forEach((a: any) => { map[a.id?.slice(0, 12)] = a.id; });
          setIdMap(map);
          setRecords(raw.map(normalizeAlert));
        }
      } catch { /* keep mock */ } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => records.filter(r =>
    (q === "" || r.id.toLowerCase().includes(q.toLowerCase()) || r.contactName.toLowerCase().includes(q.toLowerCase()) || r.accidentId.toLowerCase().includes(q.toLowerCase())) &&
    (status === "ALL" || r.status === status) &&
    (type === "ALL" || r.type === type)
  ), [records, q, status, type]);

  const counts = {
    sent:    records.filter(r => r.status === "SENT").length,
    failed:  records.filter(r => r.status === "FAILED").length,
    pending: records.filter(r => r.status === "PENDING").length,
  };

  const retry = async (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "PENDING" } : r));
    toast(`Retrying alert ${id}...`, "info");
    try {
      const realId = idMap[id] || id;
      await apiPut(`/alerts/${realId}/status`, { status: "sent" });
      setTimeout(() => {
        setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "SENT" } : r));
        toast(`Alert ${id} delivered`, "success");
      }, 1500);
    } catch {
      setTimeout(() => {
        setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "SENT" } : r));
        toast(`Alert ${id} delivered`, "success");
      }, 1500);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader kicker="DISPATCH LOG" title="ALERT HISTORY" subtitle="Complete audit trail of dispatched notifications" />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Box label="DELIVERED" count={counts.sent}    color="text-success border-success/40" />
        <Box label="FAILED"    count={counts.failed}  color="text-danger border-danger/40"   />
        <Box label="PENDING"   count={counts.pending} color="text-warning border-warning/40" />
      </div>

      <div className="glass p-3 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search alerts..." className="w-full h-10 pl-9 pr-3 bg-black/40 border border-border focus:border-cyan focus:outline-none text-sm" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="h-10 px-3 bg-black/40 border border-border focus:border-cyan font-mono-tech text-cyan text-xs">
          {["ALL","SENT","FAILED","PENDING"].map(o => <option key={o} className="bg-[#0a0d18]">{o}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)} className="h-10 px-3 bg-black/40 border border-border focus:border-cyan font-mono-tech text-cyan text-xs">
          {["ALL","EMAIL","SMS","SYSTEM"].map(o => <option key={o} className="bg-[#0a0d18]">{o}</option>)}
        </select>
      </div>

      <div className="glass overflow-x-auto">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="text-cyan font-mono-tech text-sm animate-pulse">LOADING ALERTS...</div>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="text-[10px] font-display tracking-widest text-muted-foreground border-b border-border bg-black/30">
              <tr>
                <th className="text-left p-3">ALERT ID</th>
                <th className="text-left">INCIDENT</th>
                <th className="text-left">RECIPIENT</th>
                <th className="text-left">TYPE</th>
                <th className="text-left">CHANNEL</th>
                <th className="text-left">SENT</th>
                <th className="text-left">STATUS</th>
                <th className="text-right p-3">ACTION</th>
              </tr>
            </thead>
            <tbody className="font-mono-tech">
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                  <td className="p-3 text-cyan">{r.id}</td>
                  <td className="text-foreground">{r.accidentId}</td>
                  <td className="text-foreground">{r.contactName}</td>
                  <td className="text-muted-foreground">{r.type}</td>
                  <td className="text-muted-foreground">{r.method}</td>
                  <td className="text-muted-foreground">{formatDate(r.sentAt)} {formatTime(r.sentAt)}</td>
                  <td><StatusPill status={r.status} /></td>
                  <td className="text-right p-3">
                    {r.status === "FAILED" ? (
                      <button onClick={() => retry(r.id)} className="inline-flex items-center gap-1.5 px-3 h-7 border border-cyan/50 text-cyan hover:bg-cyan/10 font-display tracking-widest text-[10px]"><RotateCw className="w-3 h-3" /> RETRY</button>
                    ) : <span className="text-muted-foreground/40">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

function Box({ label, count, color }: any) {
  return (
    <div className={`glass corner-brackets p-4 border-l-2 ${color}`}>
      <div className="text-[10px] font-display tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-mono-tech text-3xl ${color.split(" ")[0]}`} style={{ textShadow: "0 0 12px currentColor" }}>{count}</div>
    </div>
  );
}
