import type { Metadata } from "next";
import { Suspense } from "react";
import { ClipboardList } from "lucide-react";
import CanvassingClient from "@/components/ward-election/CanvassingClient";

export const metadata: Metadata = {
  title: "Canvassing | Ward Election",
  description: "Door-to-door household routes and voter sentiment tracking.",
};

export default function CanvassingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <section className="bg-gradient-to-br from-indigo-900 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-sm px-4 py-2 rounded-full mb-4 border border-white/20">
            <ClipboardList className="w-4 h-4 text-yellow-300" />
            <span>Field operations</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Canvassing</h1>
          <p className="text-indigo-100 max-w-2xl">
            Walk household routes ward-by-ward. Mark each voter as supporter, undecided, or opposition — saved on this device.
          </p>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Suspense fallback={<div className="h-64 bg-slate-100 rounded-xl animate-pulse" />}>
          <CanvassingClient />
        </Suspense>
      </section>
    </div>
  );
}
