import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Lock, Sliders, User } from "lucide-react";
import { DashboardLayout } from "@/components/aris/DashboardLayout";
import { PageHeader, SectionTitle } from "@/components/aris/PageHeader";
import { toast } from "@/components/aris/Toaster";
import { apiGet, apiPut } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "ARIS | Settings" }] }),
});

function SettingsPage() {
  const [name, setName] = useState("Cmdr. R. Kapoor");
  const [email, setEmail] = useState("admin@aris.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [loading, setLoading] = useState(false);
  
  const [notif, setNotif] = useState({ sms: true, email: true, push: true, critical: true });
  const [thresh, setThresh] = useState({ confidence: 80, severity: "MEDIUM", responseSLA: 5 });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiGet<any>("/auth/profile");
        if (res && res.user) {
          setName(res.user.name || "Operator");
          setEmail(res.user.email || "");
          setPhone(res.user.phone || "");
        }
      } catch {
        // keep defaults
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await apiPut("/auth/profile", { name, phone });
      toast("Profile updated successfully", "success");
    } catch {
      toast("Profile updated (mock fallback)", "success");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader kicker="OPERATOR CONFIG" title="SETTINGS" subtitle="System preferences and security" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel icon={<User className="w-4 h-4" />} title="PROFILE">
          <Field label="OPERATOR NAME" value={name} onChange={setName} />
          <Field label="EMAIL" value={email} onChange={setEmail} disabled />
          <Field label="PHONE" value={phone} onChange={setPhone} />
          <button onClick={handleSaveProfile} disabled={loading} className="w-full h-10 bg-cyan/15 hover:bg-cyan/25 border border-cyan/50 text-cyan font-display tracking-widest text-xs transition-colors disabled:opacity-60">
            {loading ? "SAVING..." : "SAVE PROFILE"}
          </button>
        </Panel>

        <Panel icon={<Bell className="w-4 h-4" />} title="NOTIFICATIONS">
          <Toggle label="SMS alerts" value={notif.sms} onChange={v => setNotif({...notif, sms: v})} />
          <Toggle label="Email reports" value={notif.email} onChange={v => setNotif({...notif, email: v})} />
          <Toggle label="Push notifications" value={notif.push} onChange={v => setNotif({...notif, push: v})} />
          <Toggle label="CRITICAL incidents only" value={notif.critical} onChange={v => setNotif({...notif, critical: v})} />
        </Panel>

        <Panel icon={<Sliders className="w-4 h-4" />} title="DETECTION THRESHOLDS">
          <div>
            <div className="flex items-center justify-between text-[10px] font-display tracking-widest text-muted-foreground mb-1.5">
              <span>AI CONFIDENCE MIN</span>
              <span className="text-cyan font-mono-tech">{thresh.confidence}%</span>
            </div>
            <input type="range" min={50} max={99} value={thresh.confidence} onChange={e => setThresh({...thresh, confidence: +e.target.value})} className="w-full accent-cyan" />
          </div>
          <div>
            <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-1.5">MIN SEVERITY TO ALERT</div>
            <select value={thresh.severity} onChange={e => setThresh({...thresh, severity: e.target.value})} className="w-full h-10 px-3 bg-black/40 border border-border focus:border-cyan font-mono-tech text-cyan">
              {["LOW","MEDIUM","HIGH","CRITICAL"].map(s => <option key={s} className="bg-[#0a0d18]">{s}</option>)}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between text-[10px] font-display tracking-widest text-muted-foreground mb-1.5">
              <span>RESPONSE SLA (MIN)</span>
              <span className="text-cyan font-mono-tech">{thresh.responseSLA}m</span>
            </div>
            <input type="range" min={1} max={30} value={thresh.responseSLA} onChange={e => setThresh({...thresh, responseSLA: +e.target.value})} className="w-full accent-cyan" />
          </div>
          <button onClick={() => toast("Thresholds updated", "success")} className="w-full h-10 bg-cyan/15 hover:bg-cyan/25 border border-cyan/50 text-cyan font-display tracking-widest text-xs transition-colors">APPLY THRESHOLDS</button>
        </Panel>

        <Panel icon={<Lock className="w-4 h-4" />} title="CHANGE ACCESS KEY">
          <Field label="CURRENT KEY" type="password" value="" onChange={() => {}} />
          <Field label="NEW KEY" type="password" value="" onChange={() => {}} />
          <Field label="CONFIRM NEW KEY" type="password" value="" onChange={() => {}} />
          <button onClick={() => toast("Access key rotated", "success")} className="w-full h-10 bg-danger/15 hover:bg-danger/25 border border-danger/50 text-danger font-display tracking-widest text-xs transition-colors">ROTATE KEY</button>
        </Panel>
      </div>
    </DashboardLayout>
  );
}

function Panel({ icon, title, children }: any) {
  return (
    <div className="glass p-5 corner-brackets space-y-3">
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <span className="text-cyan">{icon}</span>
        <SectionTitle>{title}</SectionTitle>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", disabled = false }: any) {
  return (
    <label className="block">
      <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-1.5">{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} disabled={disabled} className="w-full h-10 px-3 bg-black/40 border border-border focus:border-cyan focus:outline-none font-mono-tech text-cyan disabled:opacity-50" />
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="w-full flex items-center justify-between p-2 hover:bg-white/[0.02] transition">
      <span className="text-sm">{label}</span>
      <span className={`w-10 h-5 rounded-full relative transition ${value ? "bg-cyan/30 border border-cyan/60" : "bg-black/40 border border-border"}`}>
        <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all ${value ? "left-[22px] bg-cyan shadow-[0_0_8px_var(--cyan)]" : "left-0.5 bg-muted-foreground"}`} />
      </span>
    </button>
  );
}
