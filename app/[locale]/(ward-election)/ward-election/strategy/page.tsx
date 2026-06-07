import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import StrategyClient from "@/components/ward-election/StrategyClient";
import { WARDS, ELECTION_META } from "@/lib/ward-election-data";

export const metadata: Metadata = {
  title: "AI Campaign Strategy | Ward Election",
  description: "Generate a data-driven, ward-level campaign strategy with AI.",
};

export default function StrategyPage() {
  const hasData = WARDS.length > 0;

  return (
    <div className="min-h-screen bg-surface">
      <section className="bg-gradient-to-br from-indigo-900 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-sm px-4 py-2 rounded-full mb-5 border border-white/20">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>AI-Powered</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">AI Campaign Strategy</h1>
          <p className="text-indigo-100 max-w-2xl">
            Turn ward-level data into an actionable campaign plan — target wards, messaging,
            resource allocation, risks and quick wins. Built on {ELECTION_META.body}.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <StrategyClient hasData={hasData} />
      </section>
    </div>
  );
}
