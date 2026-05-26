import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, ShieldAlert, User } from "lucide-react";
import { isAuthed, login } from "@/lib/auth";
import { toast } from "@/components/aris/Toaster";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [user, setUser] = useState("admin");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && isAuthed()) nav({ to: "/dashboard" });
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const ok = await login(user, pass);
      if (ok) {
        toast("AUTHENTICATED · Access granted", "success");
        nav({ to: "/dashboard" });
      } else {
        const msg = "Invalid credentials. Use admin / aris2026";
        setError(msg);
        toast(msg, "error");
        setLoading(false);
      }
    } catch {
      const msg = "Connection failed — is the backend running?";
      setError(msg);
      toast(msg, "error");
      setLoading(false);
    }
  };

  const tagline = useTyping("EVERY SECOND SAVES A LIFE", 70);

  return (
    <div className="min-h-screen relative overflow-hidden grid place-items-center px-4">
      {/* Particle grid background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(0,229,255,0.15), transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,45,45,0.12), transparent 50%)",
        }} />
        <Particles />
      </div>

      {/* Periodic red scanline sweep */}
      <div className="red-sweep" aria-hidden />

      {/* Top stripe */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-danger/10 border-b border-danger/30 flex items-center justify-center text-[10px] font-display tracking-[0.4em] text-danger">
        <span className="pulse-cyan w-1.5 h-1.5 bg-danger rounded-full mr-2" />
        AUTHORIZED PERSONNEL ONLY · GOVERNMENT NETWORK
      </div>

      <div className="relative w-full max-w-md slide-down">
        <div className="glass corner-brackets p-8 relative">
          <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />

          <div className="flex flex-col items-center mb-6">
            <div className="relative w-16 h-16 grid place-items-center rounded-sm border border-cyan/40 bg-cyan/5 glow-cyan mb-3">
              <ShieldAlert className="w-8 h-8 text-cyan" />
              <span className="absolute inset-0 border border-cyan/20 rounded-sm pulse-cyan" />
            </div>
            <div className="font-display font-bold text-2xl tracking-[0.3em] glow-text-cyan text-cyan">ARIS</div>
            <div className="text-[10px] tracking-[0.25em] text-muted-foreground mt-1 font-display">ACCIDENT RESPONSE INTELLIGENCE SYSTEM</div>
            <div className="text-[11px] tracking-[0.25em] text-danger mt-3 font-display glow-text-red min-h-[16px]">
              {tagline}<span className="caret" />
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field icon={<User className="w-4 h-4" />} label="EMAIL / OPERATOR ID" value={user} onChange={setUser} />
            <Field icon={<Lock className="w-4 h-4" />} label="ACCESS KEY" value={pass} onChange={setPass} type="password" />

            {error && (
              <div className="text-danger text-[11px] font-mono-tech border border-danger/30 bg-danger/5 px-3 py-2">
                ⚠ {error}
              </div>
            )}

            <button disabled={loading} className="w-full h-11 mt-2 bg-cyan/15 hover:bg-cyan/25 border border-cyan/50 text-cyan font-display tracking-[0.3em] text-sm transition-all glow-cyan disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? <span className="font-mono-tech">AUTHENTICATING<span className="blink">...</span></span> : "▶ INITIATE SESSION"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-border text-[10px] font-mono-tech text-muted-foreground space-y-1">
            <div className="text-cyan/70 mb-1">// DEMO CREDENTIALS</div>
            <div className="flex justify-between"><span>OPERATOR ID</span><span className="text-foreground">admin</span></div>
            <div className="flex justify-between"><span>ACCESS KEY</span><span className="text-foreground">aris2026</span></div>
          </div>
        </div>
        <div className="mt-3 text-center text-[10px] font-mono-tech text-muted-foreground">
          NODE: IND-01 · CONN: TLS 1.3 · v2.4.1
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, value, onChange, type = "text" }: any) {
  return (
    <label className="block">
      <div className="flex items-center gap-2 text-[10px] font-display tracking-[0.2em] text-muted-foreground mb-1.5">
        <span className="text-cyan">{icon}</span> {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-11 px-3 bg-black/40 border border-border focus:border-cyan focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,229,255,0.1)] font-mono-tech text-cyan tracking-wider transition"
      />
    </label>
  );
}

function useTyping(text: string, speed = 80) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let i = 0; let timer: number;
    const loop = () => {
      setOut(text.slice(0, i));
      if (i < text.length) { i++; timer = window.setTimeout(loop, speed); }
      else { timer = window.setTimeout(() => { i = 0; loop(); }, 3500); }
    };
    loop();
    return () => clearTimeout(timer);
  }, [text, speed]);
  return out;
}

function Particles() {
  const dots = Array.from({ length: 40 });
  return (
    <>
      {dots.map((_, i) => {
        const left = (i * 37) % 100;
        const top = (i * 53) % 100;
        const d = 4 + (i % 6);
        return (
          <span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan/40"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              animation: `pulse-cyan ${d}s ease-in-out infinite`,
              animationDelay: `${(i % 10) * 0.3}s`,
            }}
          />
        );
      })}
    </>
  );
}
