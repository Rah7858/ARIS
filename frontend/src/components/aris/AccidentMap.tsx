import { useEffect, useRef } from "react";

interface Marker { lat: number; lng: number; severity?: string; label?: string }

export function AccidentMap({ markers, height = 400, center = [21.5, 78] }: { markers: Marker[]; height?: number; center?: [number, number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !ref.current) return;
      if (!mapRef.current) {
        mapRef.current = L.map(ref.current, { zoomControl: true, attributionControl: true }).setView(center, 5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OSM" }).addTo(mapRef.current);
      }
      const layer = L.layerGroup().addTo(mapRef.current);
      markers.forEach(m => {
        const icon = L.divIcon({ className: "", html: `<div class="aris-marker"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] });
        const mk = L.marker([m.lat, m.lng], { icon }).addTo(layer);
        if (m.label) mk.bindPopup(`<div style="font-family:'Share Tech Mono';color:#00E5FF;background:#060810;padding:4px 6px;">${m.label}</div>`);
      });
      return () => { layer.remove(); };
    })();
    return () => { cancelled = true; };
  }, [markers, center]);

  return (
    <div className="relative rounded-sm border border-border overflow-hidden" style={{ height: '400px', width: '100%' }}>
      <div ref={ref} style={{ height: '400px', width: '100%' }} />
      <div className="radar-sweep" aria-hidden />
    </div>
  );
}
