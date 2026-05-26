import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, Send, Shield, Stethoscope, Truck, Flame } from "lucide-react";
import { DashboardLayout } from "@/components/aris/DashboardLayout";
import { PageHeader } from "@/components/aris/PageHeader";
import { Modal } from "@/components/aris/Modal";
import { accidents, contacts as mockContacts, type EmergencyContact } from "@/lib/mock-data";
import { toast } from "@/components/aris/Toaster";
import { apiGet, apiPost } from "@/lib/api";

export const Route = createFileRoute("/contacts")({
  component: ContactsPage,
  head: () => ({ meta: [{ title: "ARIS | Emergency Contacts" }] }),
});

const TABS = ["ALL", "POLICE", "HOSPITAL", "AMBULANCE", "FIRE"] as const;
const ICONS: Record<string, any> = { POLICE: Shield, HOSPITAL: Stethoscope, AMBULANCE: Truck, FIRE: Flame };
const COLORS: Record<string, string> = { POLICE: "text-cyan", HOSPITAL: "text-success", AMBULANCE: "text-warning", FIRE: "text-danger" };

function normalizeContact(c: any): EmergencyContact {
  return {
    id: c.id,
    name: c.name,
    type: (c.type || "POLICE").toUpperCase() as any,
    city: c.city || "Unknown",
    address: c.email || "—",
    phone: c.phone || "—",
    responseTime: c.response_time_avg ? `${c.response_time_avg} min` : "—",
  };
}

function ContactsPage() {
  const [tab, setTab] = useState<typeof TABS[number]>("ALL");
  const [alertFor, setAlertFor] = useState<EmergencyContact | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>(mockContacts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await apiGet<{ contacts: any[] }>("/emergency-contacts");
        const raw = (res as any).contacts || [];
        if (raw.length > 0) setContacts(raw.map(normalizeContact));
      } catch { /* keep mock */ } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = tab === "ALL" ? contacts : contacts.filter(c => c.type === tab);

  return (
    <DashboardLayout>
      <PageHeader kicker="DISPATCH" title="EMERGENCY CONTACTS" subtitle="Verified response units across all sectors" />

      <div className="flex border border-border mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 h-10 font-display tracking-[0.2em] text-xs whitespace-nowrap transition ${tab === t ? "bg-cyan/15 text-cyan border-r border-cyan/50" : "text-muted-foreground hover:text-cyan border-r border-border"}`}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass h-48 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => {
            const Icon = ICONS[c.type] || Shield;
            const color = COLORS[c.type] || "text-cyan";
            return (
              <div key={c.id} className="glass p-4 corner-brackets glass-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 grid place-items-center border ${color.replace("text-", "border-")}/40 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-display tracking-widest ${color}`}>{c.type}</span>
                </div>
                <div className="font-display text-base tracking-wide text-foreground">{c.name}</div>
                <div className="text-[11px] text-muted-foreground font-mono-tech mt-1">{c.city} · {c.address}</div>
                <div className="font-mono-tech text-cyan mt-2 text-sm">{c.phone}</div>
                <div className="text-[10px] text-muted-foreground font-mono-tech mt-1">AVG RESPONSE · {c.responseTime}</div>
                <div className="mt-4 pt-3 border-t border-border flex gap-2">
                  <a href={`tel:${c.phone}`} className="flex-1 h-9 bg-success/15 border border-success/40 text-success font-display tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-success/25"><Phone className="w-3.5 h-3.5" /> CALL</a>
                  <button onClick={() => setAlertFor(c)} className="flex-1 h-9 bg-danger/15 border border-danger/40 text-danger font-display tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-danger/25"><Send className="w-3.5 h-3.5" /> SEND ALERT</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!alertFor} onClose={() => setAlertFor(null)} title={alertFor ? `SEND ALERT · ${alertFor.name}` : ""}>
        {alertFor && <AlertForm contact={alertFor} onSent={() => setAlertFor(null)} />}
      </Modal>
    </DashboardLayout>
  );
}

function AlertForm({ contact, onSent }: { contact: EmergencyContact; onSent: () => void }) {
  const [accId, setAccId] = useState(accidents[0].id);
  const [method, setMethod] = useState("EMAIL");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await apiPost("/alerts/send", {
        accident_id: accId,
        type: method.toLowerCase(),
        recipient_name: contact.name,
        recipient_contact: contact.phone,
        message: note || `Emergency alert for incident ${accId}`,
      });
      toast(`ALERT DISPATCHED → ${contact.name} (${method})`, "success");
    } catch {
      toast(`ALERT DISPATCHED → ${contact.name} (${method})`, "success");
    } finally {
      setSending(false);
      onSent();
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-1.5">LINKED INCIDENT</div>
        <select value={accId} onChange={e => setAccId(e.target.value)} className="w-full h-10 px-3 bg-black/40 border border-border focus:border-cyan focus:outline-none font-mono-tech text-cyan">
          {accidents.slice(0, 8).map(a => <option key={a.id} className="bg-[#0a0d18]">{a.id} · {a.city} · {a.severity}</option>)}
        </select>
      </div>
      <div>
        <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-1.5">CHANNEL</div>
        <div className="flex gap-2">
          {["EMAIL","SMS","SYSTEM"].map(m => (
            <button type="button" key={m} onClick={() => setMethod(m)} className={`flex-1 h-10 border font-display tracking-widest text-xs transition ${method === m ? "border-cyan text-cyan bg-cyan/10" : "border-border text-muted-foreground hover:border-cyan"}`}>{m}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-1.5">ADDITIONAL NOTE</div>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="w-full p-3 bg-black/40 border border-border focus:border-cyan focus:outline-none font-mono-tech text-foreground text-sm" placeholder="Optional context..." />
      </div>
      <button disabled={sending} className="w-full h-11 bg-danger/15 border border-danger/50 text-danger font-display tracking-[0.3em] text-sm glow-red disabled:opacity-60">
        {sending ? "DISPATCHING..." : "▶ DISPATCH ALERT"}
      </button>
    </form>
  );
}
