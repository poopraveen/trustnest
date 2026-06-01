import type { Metadata } from "next";
import { Suspense } from "react";
import { Bot } from "lucide-react";
import WardElectionChat from "@/components/ward-election/WardElectionChat";
import { getCombinedElectoralStats } from "@/lib/ward-election-context";

export const metadata: Metadata = {
  title: "Election AI Chat | Ward Election",
  description: "Ask questions about Veppampattu and Perumalpattu ward election data.",
};

export default function WardElectionChatPage() {
  const stats = getCombinedElectoralStats();
  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());

  return (
    <div className="min-h-screen bg-surface">
      <section className="bg-gradient-to-br from-indigo-900 to-indigo-700 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm px-3 py-1.5 rounded-full mb-4 border border-white/20">
            <Bot className="w-4 h-4 text-yellow-300" />
            <span>Powered by OpenAI</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Election AI Assistant</h1>
          <p className="text-indigo-100 text-sm mt-2">
            Ask about{" "}
            <strong className="text-white">
              {stats.totalParts} parts
            </strong>{" "}
            and{" "}
            <strong className="text-white">
              {stats.totalElectors.toLocaleString("en-IN")} electors
            </strong>{" "}
            across Veppampattu and Perumalpattu.
          </p>
        </div>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <Suspense
          fallback={
            <div className="h-[520px] bg-slate-100 rounded-2xl animate-pulse" />
          }
        >
          <WardElectionChat openaiConfigured={openaiConfigured} />
        </Suspense>
        <p className="text-xs text-slate-400 text-center mt-4">
          {openaiConfigured
            ? "Searches live voter JSON, ward rolls, and households — ask by name, ID, house, or part number."
            : "Set OPENAI_API_KEY in .env.local (see .env.example) and restart the dev server."}
        </p>
      </section>
    </div>
  );
}
