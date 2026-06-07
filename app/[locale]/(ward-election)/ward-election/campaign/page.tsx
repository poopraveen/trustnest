import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import CampaignDashboard from "@/components/ward-election/CampaignDashboard";

export const metadata: Metadata = {
  title: "Campaign Tracker | Ward Election",
  description: "Track canvassing progress and voter sentiment across wards.",
};

export default function CampaignPage() {
  return (
    <div className="min-h-screen bg-surface">
      <section className="bg-gradient-to-br from-indigo-900 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-sm px-4 py-2 rounded-full mb-4 border border-white/20">
            <BarChart3 className="w-4 h-4 text-yellow-300" />
            <span>Campaign HQ</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Campaign Tracker</h1>
          <p className="text-indigo-100 max-w-2xl">
            Monitor contact rates, supporter counts, and ward-level canvassing progress.
          </p>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <CampaignDashboard />
      </section>
    </div>
  );
}
