"use client";

import { useState } from "react";
import {
  Sparkles, Target, MessageSquare, Wallet, AlertTriangle, Zap, Loader2,
} from "lucide-react";
import type { WardStrategy } from "@/lib/ward-election-ai";

const PRIORITY_STYLE: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function StrategyClient({ hasData }: { hasData: boolean }) {
  const [objective, setObjective] = useState("");
  const [party, setParty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<WardStrategy | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setStrategy(null);
    try {
      const res = await fetch("/api/ward-election/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective, party }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setStrategy(data.strategy as WardStrategy);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Party / Candidate <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={party}
              onChange={(e) => setParty(e.target.value)}
              placeholder="e.g. Independent — R. Kumar"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Campaign objective <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g. Maximise turnout in low-margin wards"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={loading || !hasData}
          className="mt-4 inline-flex items-center gap-2 bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Generate AI Strategy
            </>
          )}
        </button>

        {!hasData && (
          <p className="mt-3 text-sm text-amber-600">
            Add ward data to <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">lib/ward-election-data.ts</code> to enable strategy generation.
          </p>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {strategy && (
        <div className="space-y-6">
          {strategy.overview && (
            <section className="card p-6">
              <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Strategic Overview
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{strategy.overview}</p>
            </section>
          )}

          {strategy.targetWards.length > 0 && (
            <section className="card p-6">
              <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                <Target className="w-4 h-4 text-indigo-600" /> Target Wards
              </h3>
              <div className="space-y-3">
                {strategy.targetWards.map((w, i) => (
                  <div key={`${w.wardId}-${i}`} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize flex-shrink-0 ${PRIORITY_STYLE[w.priority] ?? PRIORITY_STYLE.low}`}>
                      {w.priority}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{w.name}</p>
                      <p className="text-sm text-slate-600 mt-0.5">{w.rationale}</p>
                      {w.turnoutTarget && (
                        <p className="text-xs text-indigo-600 mt-1">🎯 {w.turnoutTarget}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {strategy.messagingThemes.length > 0 && (
            <section className="card p-6">
              <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                <MessageSquare className="w-4 h-4 text-indigo-600" /> Messaging Themes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {strategy.messagingThemes.map((m, i) => (
                  <div key={i} className="p-3 rounded-lg border border-slate-100">
                    <p className="font-semibold text-slate-800 text-sm">{m.theme}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Audience: {m.audience}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.channels?.map((c, j) => (
                        <span key={j} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {strategy.resourceAllocation.length > 0 && (
              <section className="card p-6">
                <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                  <Wallet className="w-4 h-4 text-indigo-600" /> Resource Allocation
                </h3>
                <ul className="space-y-2.5">
                  {strategy.resourceAllocation.map((r, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-semibold text-slate-800 capitalize">{r.area}: </span>
                      <span className="text-slate-600">{r.recommendation}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {strategy.risks.length > 0 && (
              <section className="card p-6">
                <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Risks &amp; Mitigation
                </h3>
                <ul className="space-y-3">
                  {strategy.risks.map((r, i) => (
                    <li key={i} className="text-sm">
                      <p className="font-semibold text-slate-800">{r.risk}</p>
                      <p className="text-slate-600 mt-0.5">→ {r.mitigation}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {strategy.quickWins.length > 0 && (
            <section className="card p-6">
              <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                <Zap className="w-4 h-4 text-emerald-600" /> Quick Wins
              </h3>
              <ul className="space-y-2">
                {strategy.quickWins.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-emerald-600 mt-0.5">✓</span> {q}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
