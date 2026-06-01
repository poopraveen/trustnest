import type { Metadata } from "next";
import { Vote } from "lucide-react";
import TurnoutClient from "@/components/ward-election/TurnoutClient";

export const metadata: Metadata = {
  title: "Turnout & GOTV | Ward Election",
  description: "Election day turnout forecast, GOTV checklist, and booth priorities.",
};

export default function TurnoutPage() {
  return (
    <div className="min-h-screen bg-surface">
      <section className="bg-gradient-to-br from-indigo-900 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-sm px-4 py-2 rounded-full mb-4 border border-white/20">
            <Vote className="w-4 h-4 text-yellow-300" />
            <span>Election day</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Turnout &amp; GOTV</h1>
          <p className="text-indigo-100 max-w-2xl">
            Forecast turnout, plan get-out-the-vote pushes, and run through your election day checklist.
          </p>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <TurnoutClient />
      </section>
    </div>
  );
}
