import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, AlertTriangle, BarChart3, Bell, Camera, Cog, LayoutDashboard, LogOut, Menu, Phone, ShieldAlert } from "lucide-react";
import { logout } from "@/lib/auth";
import { AuthGuard } from "./AuthGuard";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Command Center", key: "G+D" },
  { to: "/accidents", icon: AlertTriangle, label: "Accidents", key: "G+A" },
  { to: "/cameras", icon: Camera, label: "Cameras", key: "G+C" },
  { to: "/analytics", icon: BarChart3, label: "Analytics", key: "G+N" },
  { to: "/contacts", icon: Phone, label: "Emergency", key: "G+E" },
  { to: "/alerts", icon: Bell, label: "Alert History", key: "G+H" },
  { to: "/settings", icon: Cog, label: "Settings", key: "G+S" },
] as const;

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  return now;
}

export function DashboardLayout({ children, alertCount = 3 }: { children: React.ReactNode; alertCount?: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const now = useClock();
  const nav = useNavigate();
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDemo(localStorage.getItem("aris_is_demo") === "true");
    }
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        {/* Top navbar */}
        <header className="h-14 border-b border-border bg-[#0a0d18]/80 backdrop-blur-xl flex items-center px-4 gap-4 z-30 relative">
          <button onClick={() => setCollapsed(c => !c)} className="text-muted-foreground hover:text-cyan transition">
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 grid place-items-center rounded-sm border border-cyan/40 bg-cyan/10 glow-cyan">
              <ShieldAlert className="w-4 h-4 text-cyan" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-base tracking-[0.25em] glow-text-cyan text-cyan">ARIS</div>
              <div className="text-[9px] tracking-[0.18em] text-muted-foreground font-display">ACCIDENT RESPONSE INTEL</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 rounded-sm border border-success/30 bg-success/5">
            <span className="w-1.5 h-1.5 rounded-full bg-success pulse-cyan" />
            <span className="text-[10px] font-display tracking-[0.2em] text-success">SYSTEM ACTIVE</span>
          </div>

          {isDemo && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-sm border border-warning/45 bg-warning/5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              <span className="text-[10px] font-display tracking-[0.2em] text-warning">DEMO MODE</span>
            </div>
          )}

          <div className="flex-1" />

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-sm border border-border bg-card">
            <Activity className="w-3 h-3 text-cyan" />
            <span className="font-mono-tech text-sm text-cyan">{now.toLocaleTimeString("en-GB")}</span>
            <span className="text-[10px] text-muted-foreground font-mono-tech ml-1">IST</span>
          </div>

          <button className="relative h-9 w-9 grid place-items-center rounded-sm border border-border hover:border-danger/50 transition">
            <Bell className="w-4 h-4 text-muted-foreground" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-danger text-[10px] font-mono-tech text-white pulse-dot">
                {alertCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { logout(); nav({ to: "/login" }); }}
            className="h-9 px-3 grid place-items-center rounded-sm border border-border hover:border-danger/50 hover:text-danger text-muted-foreground transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <aside className={`${collapsed ? "w-14" : "w-56"} transition-all duration-300 border-r border-border bg-[#080b14]/80 backdrop-blur-xl flex flex-col`}>
            <nav className="p-2 flex flex-col gap-1 flex-1">
              {navItems.map(item => {
                const active = pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to} className={`group relative flex items-center gap-3 px-3 h-10 rounded-sm transition-all ${active ? "bg-cyan/10 text-cyan" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.02]"}`}>
                    {active && <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan shadow-[0_0_8px_var(--cyan)]" />}
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="font-display text-[13px] tracking-wider flex-1">{item.label}</span>}
                    {!collapsed && <kbd className="hidden lg:inline text-[9px] font-mono-tech text-muted-foreground/60 border border-border px-1 rounded-sm">{item.key}</kbd>}
                    {collapsed && (
                      <span className="nav-tooltip">{item.label}<kbd>{item.key}</kbd></span>
                    )}
                  </Link>
                );
              })}
            </nav>
            {!collapsed && (
              <div className="p-3 m-2 glass text-[10px] font-mono-tech text-muted-foreground space-y-1">
                <div className="flex justify-between"><span>BUILD</span><span className="text-cyan">v2.4.1</span></div>
                <div className="flex justify-between"><span>NODE</span><span className="text-success">IND-01</span></div>
                <div className="flex justify-between"><span>PING</span><span className="text-cyan">12ms</span></div>
              </div>
            )}
          </aside>

          {/* Main */}
          <main key={pathname} className="flex-1 min-w-0 overflow-x-hidden p-4 md:p-6 page-in">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
