import { Cpu, Zap, Send, Database } from "lucide-react";

interface StepItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  heading: string;
  oneLiner: string;
  description: string;
  badge: string;
}

export function SystemFlow() {
  const steps: StepItem[] = [
    {
      id: "01",
      icon: Cpu,
      heading: "Computer Vision Detection",
      oneLiner: "Automated Video Feed Analysis & Collision Event Classification",
      description: "Real-time camera feeds are processed continuously using a computer vision pipeline to identify vehicle collisions, single-vehicle skids, and multi-car pileups. The system filters out environmental noise and assigns a dynamic AI confidence score (75–99%) to guarantee high-integrity event detection.",
      badge: "AI Pipeline",
    },
    {
      id: "02",
      icon: Zap,
      heading: "Low-Latency Event Ingestion",
      oneLiner: "Sub-Second WebSocket Propagation to the Command Center",
      description: "Immediately upon collision confirmation, the backend triggers an event-driven payload and broadcasts it via raw WebSockets to all connected clients. The React-based Command Center HUD ingests this message in milliseconds, instantaneously plotting the accident coordinates on the Leaflet map and triggering a visual alert card.",
      badge: "WebSocket",
    },
    {
      id: "03",
      icon: Send,
      heading: "Automated Emergency Dispatch",
      oneLiner: "Orchestrated SMS & Email Routing to First Responders",
      description: "Once an alert is active, the platform coordinates immediate dispatch workflows using integrated communication channels like Twilio SMS and Nodemailer email to notify the nearest police, hospital, and fire units. Operators can also utilize the dashboard to manually trigger custom dispatches or override automated notifications.",
      badge: "Dispatch Node",
    },
    {
      id: "04",
      icon: Database,
      heading: "Immutable Incident Audit Trail",
      oneLiner: "Structured Incident Archiving & Post-Incident Telemetry Analysis",
      description: "Every detected accident, dispatch event, and operator response is recorded to a secure Supabase-managed PostgreSQL database with strict timestamps, severity levels, and resolution status logs. Administrative panels provide search, filter, and analytical visualization tools to review dispatch metrics and evaluate response performance.",
      badge: "PostgreSQL",
    },
  ];

  return (
    <section className="relative w-full py-16 px-4 md:px-8 border-t border-border bg-[#060810] text-[#00E5FF] font-mono-tech overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-danger/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Cyber Grid Background overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-cyan/35 bg-cyan/5 text-[10px] tracking-[0.2em] uppercase text-cyan animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
            Operational Flow
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-[0.15em] text-white uppercase">
            How The System Works
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A secure, automated lifecycle pipeline engineered to connect edge-level vision telemetry with emergency responders in milliseconds.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="group relative flex flex-col justify-between p-6 rounded-sm border border-border bg-[#0a0d18]/70 backdrop-blur-md hover:border-cyan/45 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
              >
                {/* Tech corner bracket accents */}
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan/40 group-hover:border-cyan transition-colors" />
                <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan/40 group-hover:border-cyan transition-colors" />
                <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan/40 group-hover:border-cyan transition-colors" />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan/40 group-hover:border-cyan transition-colors" />

                <div className="space-y-4">
                  {/* Step Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 grid place-items-center rounded-sm border border-cyan/30 bg-cyan/5 text-cyan group-hover:bg-cyan/10 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                        Step {step.id}
                      </span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 border border-cyan/20 rounded-full text-cyan/70 bg-cyan/5 uppercase tracking-widest">
                      {step.badge}
                    </span>
                  </div>

                  {/* Heading & Punchy One-Liner */}
                  <div className="space-y-1">
                    <h3 className="text-base font-display font-semibold tracking-wide text-white uppercase">
                      {step.heading}
                    </h3>
                    <p className="text-xs text-cyan font-medium leading-relaxed">
                      {step.oneLiner}
                    </p>
                  </div>

                  {/* 2-Sentence Description */}
                  <p className="text-xs text-muted-foreground/80 leading-relaxed font-sans">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
