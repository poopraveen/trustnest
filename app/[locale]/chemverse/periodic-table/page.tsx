"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, Atom } from "lucide-react";
import { ChemElement } from "@/lib/chemverse/elements";

const PeriodicTable = dynamic(() => import("@/components/chemverse/PeriodicTable"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
    </div>
  ),
});

const ElementModal = dynamic(() => import("@/components/chemverse/ElementModal"), { ssr: false });

export default function PeriodicTablePage() {
  const [selected, setSelected] = useState<ChemElement | null>(null);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <Atom className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Periodic Table</h1>
            <p className="text-sm text-slate-400">Click any element to explore its Bohr model and properties</p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-6">
          <PeriodicTable onElementClick={el => setSelected(el)} />
        </div>
      </div>

      {selected && (
        <ElementModal element={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
