import type { Metadata } from "next";
import { Suspense } from "react";
import { Map } from "lucide-react";
import WardElectionMap from "@/components/ward-election/WardElectionMap";
import { getElectionArea, resolveAreaId } from "@/lib/ward-election-areas";
import { getWardsForArea } from "@/lib/ward-election-data";
import { getMapPinsForArea } from "@/lib/ward-election-map";

export const metadata: Metadata = {
  title: "Ward Map | Ward Election",
  description: "Polling parts and campaign geography for your election area.",
};

export default function WardElectionMapPage({
  searchParams,
}: {
  searchParams: { area?: string };
}) {
  const areaId = resolveAreaId(searchParams.area);
  const area = getElectionArea(areaId)!;
  const wards = getWardsForArea(areaId);
  const pins = getMapPinsForArea(areaId);

  return (
    <div className="min-h-screen bg-surface">
      <section className="bg-gradient-to-br from-indigo-900 to-indigo-700 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm px-3 py-1.5 rounded-full mb-4 border border-white/20">
            <Map className="w-4 h-4 text-yellow-300" />
            <span>{area.subtitle}</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{area.name} — Ward Map</h1>
          <p className="text-indigo-100 text-sm mt-2 max-w-2xl">
            {wards.length > 0
              ? `${wards.length} polling parts · pin positions are approximate`
              : "No parts loaded yet for this area"}
            {" — "}update coordinates in{" "}
            <code className="text-indigo-200">lib/ward-election-map.ts</code> after a field survey.
          </p>
        </div>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Suspense fallback={<div className="h-96 bg-slate-100 rounded-xl animate-pulse" />}>
          <WardElectionMap area={area} wards={wards} pins={pins} />
        </Suspense>
      </section>
    </div>
  );
}
