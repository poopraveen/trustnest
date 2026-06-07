"use client";

import { useEffect, useRef } from "react";
import { Link } from "@/navigation";
import type { ElectionArea } from "@/lib/ward-election-areas";
import { wardElectionHref } from "@/lib/ward-election-areas";
import type { Ward } from "@/lib/ward-election-data";
import type { PartMapPin } from "@/lib/ward-election-map";
import { MapPin, AlertCircle } from "lucide-react";

export interface WardElectionMapProps {
  area: ElectionArea;
  wards: Ward[];
  pins: PartMapPin[];
}

function pinColor(electors?: number): string {
  if (electors == null || electors === 0) return "#94a3b8";
  if (electors >= 1000) return "#7c3aed";
  if (electors >= 800) return "#4f46e5";
  return "#2563eb";
}

export default function WardElectionMap({ area, wards, pins }: WardElectionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<{ remove: () => void } | null>(null);

  const wardByPart = new Map(wards.map((w) => [w.partNo ?? w.number, w]));

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, {
        center: [area.center.lat, area.center.lng],
        zoom: area.zoom,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.circle([area.center.lat, area.center.lng], {
        color: "#4f46e5",
        fillColor: "#6366f1",
        fillOpacity: 0.08,
        radius: 1800,
        weight: 1,
        dashArray: "6 4",
      }).addTo(map);

      const bounds: [number, number][] = [[area.center.lat, area.center.lng]];

      for (const pin of pins) {
        const ward = wardByPart.get(pin.partNo);
        const color = pinColor(ward?.electorate);
        const label = pin.label ?? `Part ${pin.partNo}`;
        const electors = ward?.electorate?.toLocaleString("en-IN") ?? "—";

        const icon = L.divIcon({
          html: `
            <div style="
              background: ${color};
              color: white;
              min-width: 28px;
              padding: 4px 8px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 700;
              text-align: center;
              box-shadow: 0 3px 10px rgba(0,0,0,0.25);
              border: 2px solid white;
            ">${pin.partNo}</div>
          `,
          className: "",
          iconSize: [36, 28],
          iconAnchor: [18, 14],
        });

        const partHref = wardElectionHref(
          `/ward-election/wards/${pin.partNo}`,
          area.id
        );
        const canvassHref = wardElectionHref(
          `/ward-election/canvassing?ward=${pin.partNo}`,
          area.id
        );

        const popup = `
          <div style="min-width:180px;font-family:system-ui,sans-serif">
            <strong style="font-size:13px">Part ${pin.partNo}</strong>
            <div style="font-size:11px;color:#64748b;margin:4px 0">${label}</div>
            <div style="font-size:12px;margin-bottom:8px"><b>${electors}</b> electors</div>
            <a href="${partHref}" style="font-size:12px;color:#4f46e5;margin-right:12px">Ward detail</a>
            <a href="${canvassHref}" style="font-size:12px;color:#4f46e5">Canvass</a>
          </div>
        `;

        L.marker([pin.lat, pin.lng], { icon })
          .addTo(map)
          .bindPopup(popup);

        bounds.push([pin.lat, pin.lng]);
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      }

      mapInstanceRef.current = map;
    });

    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [area.id, area.center.lat, area.center.lng, area.zoom, pins, wards]);

  const noPins = pins.length === 0;

  return (
    <div className="space-y-4">
      {noPins && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold">Map pins not configured for {area.name}</p>
            <p className="text-amber-800/90 mt-1 text-xs">
              Add polling-part coordinates in{" "}
              <code className="bg-amber-100 px-1 rounded">lib/ward-election-map.ts</code>, then
              add wards in{" "}
              <code className="bg-amber-100 px-1 rounded">lib/ward-election-data.ts</code>.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-medium text-slate-700">
            {area.name} — polling parts on map
          </span>
          <span className="text-xs text-slate-400 ml-auto">
            Pin color: darker = more electors · Click for links
          </span>
        </div>
        <div ref={mapRef} className="w-full h-[min(70vh,520px)] bg-slate-100" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {wards.map((w) => (
          <Link
            key={w.id}
            href={wardElectionHref(`/ward-election/wards/${w.partNo ?? w.number}`, area.id)}
            className="card p-3 hover:border-indigo-200 border border-transparent transition-colors"
          >
            <p className="font-semibold text-sm text-slate-800">
              Part {w.partNo ?? w.number}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
              {w.pollingStation ?? w.name}
            </p>
            <p className="text-xs font-data text-indigo-600 mt-1">
              {(w.electorate ?? 0).toLocaleString("en-IN")} electors
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
