"use client";

import dynamic from "next/dynamic";
import { Loader2, LayoutDashboard } from "lucide-react";

const ChemDashboard = dynamic(() => import("@/components/chemverse/ChemDashboard"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Learning Dashboard</h1>
            <p className="text-sm text-slate-400">Track progress, earn achievements, and test your knowledge</p>
          </div>
        </div>
        <ChemDashboard />
      </div>
    </div>
  );
}
