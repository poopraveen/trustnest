import type { Metadata } from "next";
import { Trophy, BarChart3 } from "lucide-react";
import WinPlanClient, { type PlanWard } from "@/components/ward-election/WinPlanClient";
import VoterAnalytics from "@/components/ward-election/VoterAnalytics";
import { WARDS, ELECTION_META } from "@/lib/ward-election-data";

export const metadata: Metadata = {
  title: "Win Plan | Ward Election",
  description: "Visual path-to-victory planner built on ward-level electoral roll data.",
};

export default function PlanPage() {
  const wards: PlanWard[] = WARDS.map((w) => ({
    id: w.id,
    name: w.name,
    number: w.number,
    partNo: w.partNo,
    electorate: w.electorate ?? 0,
    male: w.male ?? 0,
    female: w.female ?? 0,
    sections: w.sections,
  }));

  return (
    <div className="min-h-screen bg-surface">
      <section className="bg-gradient-to-br from-indigo-900 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-sm px-4 py-2 rounded-full mb-5 border border-white/20">
            <Trophy className="w-4 h-4 text-yellow-300" />
            <span>Path to Victory</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Win Plan</h1>
          <p className="text-indigo-100 max-w-2xl">
            Model turnout and vote-share scenarios, see votes needed to win, and identify
            your must-win wards. Built on {ELECTION_META.body}.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <WinPlanClient wards={wards} />
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-800">Voter Analytics</h2>
        </div>
        <VoterAnalytics />
      </section>
    </div>
  );
}
