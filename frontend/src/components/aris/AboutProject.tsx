import { Code2, Heart } from "lucide-react";

export function AboutProject() {
  return (
    <section className="relative w-full py-16 px-4 md:px-8 border-t border-border bg-[#060810] text-[#00E5FF] font-mono-tech overflow-hidden">
      {/* Dynamic light bursts for visual depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="group relative p-8 md:p-10 rounded-sm border border-border bg-[#0a0d18]/60 backdrop-blur-md hover:border-cyan/40 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          {/* Tech HUD Corner Brackets */}
          <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan/40 group-hover:border-cyan transition-colors" />
          <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan/40 group-hover:border-cyan transition-colors" />
          <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan/40 group-hover:border-cyan transition-colors" />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan/40 group-hover:border-cyan transition-colors" />

          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Developer profile badge */}
            <div className="flex flex-col items-center gap-3 shrink-0 mx-auto md:mx-0">
              <div className="w-16 h-16 rounded-sm border border-cyan/35 bg-cyan/5 flex items-center justify-center text-cyan shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <Code2 className="w-8 h-8" />
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-white uppercase tracking-wider">Rahul Kumar</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">Solo Creator</div>
              </div>
            </div>

            {/* Content block */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-cyan/20 text-[9px] uppercase tracking-widest text-cyan bg-cyan/5">
                <Heart className="w-2.5 h-2.5 animate-pulse text-danger" /> Behind the Code
              </div>

              <h2 className="text-lg md:text-xl font-display font-bold tracking-wider text-white uppercase">
                About This Project
              </h2>

              <p className="text-xs md:text-sm text-muted-foreground/90 leading-relaxed font-sans">
                I built ARIS solo—engineering everything from the React frontend and low-latency Node.js WebSocket backend to the PostgreSQL schema and multi-platform deployments. I was tired of building typical CRUD tutorial apps; I wanted to build a complex, event-driven system that handles high-frequency data and solves a real, high-stakes problem: emergency dispatch latency. Building a platform where seconds determine survival pushed me to prioritize stability, fail-safes, and clean state coordination. ARIS is my demonstration that I don’t just write code—I build production-ready software designed to solve meaningful real-world challenges.
              </p>

              <div className="pt-2 flex items-center justify-center md:justify-start gap-4 text-[10px] uppercase tracking-wider text-muted-foreground">
                <div>
                  <span className="text-cyan font-mono-tech mr-1">Architecture:</span> Full-Stack
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div>
                  <span className="text-cyan font-mono-tech mr-1">Engineering:</span> Event-Driven
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
