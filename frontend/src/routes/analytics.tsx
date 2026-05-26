import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { DashboardLayout } from "@/components/aris/DashboardLayout";
import { PageHeader, SectionTitle } from "@/components/aris/PageHeader";
import { AccidentMap } from "@/components/aris/AccidentMap";
import { hourlyAccidents, severityDistribution, responseTimeTrend, cityAccidents, weeklyComparison, accidents } from "@/lib/mock-data";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
  head: () => ({ meta: [{ title: "ARIS | Analytics" }] }),
});

const RANGES = ["TODAY", "WEEK", "MONTH", "YEAR"] as const;

function AnalyticsPage() {
  const [range, setRange] = useState<typeof RANGES[number]>("WEEK");
  const [hourly, setHourly]     = useState(hourlyAccidents);
  const [sevDist, setSevDist]   = useState(severityDistribution);
  const [respTrend, setRespTrend] = useState(responseTimeTrend);
  const [cities, setCities]     = useState(cityAccidents);
  const [weekly, setWeekly]     = useState(weeklyComparison);
  const [heatmap, setHeatmap]   = useState(accidents.map(a => ({ lat: a.lat, lng: a.lng, label: `${a.id} · ${a.severity}` })));
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [h, s, r, c, w] = await Promise.allSettled([
          apiGet<any>("/analytics/hourly"),
          apiGet<any>("/analytics/severity"),
          apiGet<any>("/analytics/response-times"),
          apiGet<any>("/analytics/cities"),
          apiGet<any>("/analytics/weekly"),
        ]);

        if (h.status === "fulfilled" && h.value?.hourly?.length > 0) {
          setHourly(h.value.hourly.map((d: any) => ({ hour: `${d.hour}h`, accidents: d.count })));
        }
        if (s.status === "fulfilled" && s.value?.distribution?.length > 0) {
          const COLORS: Record<string, string> = { critical: "#FF2D2D", high: "#FF8C00", medium: "#FFD700", low: "#00C853" };
          setSevDist(s.value.distribution.map((d: any) => ({
            name: d.severity.toUpperCase(), value: d.total, color: COLORS[d.severity] || "#00E5FF",
          })));
        }
        if (r.status === "fulfilled" && r.value?.by_severity?.length > 0) {
          setRespTrend(r.value.by_severity.map((d: any, i: number) => ({ day: d.severity.toUpperCase(), time: d.avg_minutes || 0 })));
        }
        if (c.status === "fulfilled" && c.value?.cities?.length > 0) {
          setCities(c.value.cities.map((d: any) => ({ city: d.city, count: d.total_accidents })));
        }
        if (w.status === "fulfilled" && w.value?.weekly?.length > 0) {
          setWeekly(w.value.weekly.map((d: any) => ({
            day: new Date(d.week_start).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
            lastWeek: d.critical + d.high,
            thisWeek: d.total,
          })));
        }

        // Heatmap from live accidents
        try {
          const liveRes = await apiGet<{ accidents: any[] }>("/accidents/live");
          const live = (liveRes as any).accidents || [];
          if (live.length > 0) {
            setHeatmap(live.map((a: any) => ({ lat: parseFloat(a.latitude) || 20, lng: parseFloat(a.longitude) || 78, label: `${a.severity?.toUpperCase()} · ${a.location_name}` })));
          }
        } catch { /* keep mock */ }
      } catch {
        // silently keep mock data
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [range]);

  return (
    <DashboardLayout>
      <PageHeader kicker="INTELLIGENCE" title="ANALYTICS"
        subtitle="Statistical synthesis of accident patterns"
        right={
          <div className="flex border border-border">
            {RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)} className={`px-4 h-10 font-display tracking-widest text-xs transition ${range === r ? "bg-cyan/15 text-cyan border-cyan/50" : "text-muted-foreground hover:text-cyan"}`}>{r}</button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="ACCIDENTS BY HOUR" subtitle="24-hour distribution">
          {loading ? <SkeletonChart /> : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={hourly}>
                <defs>
                  <linearGradient id="hourFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF2D2D" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#FF2D2D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="#555" tick={{ fill: "#8893A8", fontSize: 10, fontFamily: "Share Tech Mono" }} interval={2} />
                <YAxis stroke="#555" tick={{ fill: "#8893A8", fontSize: 10, fontFamily: "Share Tech Mono" }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#FF2D2D", strokeOpacity: 0.3 }} />
                <Area type="monotone" dataKey="accidents" stroke="#FF2D2D" strokeWidth={2} fill="url(#hourFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="SEVERITY DISTRIBUTION" subtitle="By classification">
          {loading ? <SkeletonChart /> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={sevDist} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} stroke="#060810" strokeWidth={2}>
                  {sevDist.map(d => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: "Rajdhani", letterSpacing: "0.15em", color: "#8893A8" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="RESPONSE TIME BY SEVERITY" subtitle="Avg minutes to resolution">
          {loading ? <SkeletonChart /> : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={respTrend}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#555" tick={{ fill: "#8893A8", fontSize: 10, fontFamily: "Share Tech Mono" }} />
                <YAxis stroke="#555" tick={{ fill: "#8893A8", fontSize: 10, fontFamily: "Share Tech Mono" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="time" stroke="#00E5FF" strokeWidth={2} dot={{ fill: "#00E5FF", r: 3 }} activeDot={{ r: 6, fill: "#00E5FF", stroke: "#fff" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="ACCIDENTS BY CITY" subtitle="Regional breakdown">
          {loading ? <SkeletonChart /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cities} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#555" tick={{ fill: "#8893A8", fontSize: 10, fontFamily: "Share Tech Mono" }} />
                <YAxis type="category" dataKey="city" stroke="#555" tick={{ fill: "#E8ECF4", fontSize: 11, fontFamily: "Rajdhani" }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,229,255,0.05)" }} />
                <Bar dataKey="count" fill="#00E5FF" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <ChartCard title="WEEKLY COMPARISON" subtitle="This week vs last week">
        {loading ? <SkeletonChart height={240} /> : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weekly}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#555" tick={{ fill: "#8893A8", fontSize: 11, fontFamily: "Rajdhani" }} />
              <YAxis stroke="#555" tick={{ fill: "#8893A8", fontSize: 10, fontFamily: "Share Tech Mono" }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,229,255,0.05)" }} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "Rajdhani", letterSpacing: "0.15em" }} />
              <Bar dataKey="lastWeek" fill="#555" name="LAST WEEK" radius={[2, 2, 0, 0]} />
              <Bar dataKey="thisWeek" fill="#00E5FF" name="THIS WEEK" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="mt-4">
        <div className="glass p-4">
          <SectionTitle accent="red">INCIDENT HEATMAP · NATIONAL</SectionTitle>
          <AccidentMap height={420} markers={heatmap} />
        </div>
      </div>
    </DashboardLayout>
  );
}

const tooltipStyle = {
  background: "rgba(6,8,16,0.95)", border: "1px solid rgba(0,229,255,0.4)",
  borderRadius: 4, fontFamily: "Share Tech Mono", fontSize: 11, color: "#00E5FF",
};

function SkeletonChart({ height = 260 }) {
  return <div className="animate-pulse bg-white/5 rounded" style={{ height }} />;
}

function ChartCard({ title, subtitle, children }: any) {
  return (
    <div className="glass p-4 corner-brackets">
      <div className="mb-3">
        <div className="font-display tracking-[0.2em] text-xs text-cyan">{title}</div>
        <div className="text-[10px] font-mono-tech text-muted-foreground">{subtitle}</div>
      </div>
      {children}
    </div>
  );
}
