"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  {
    icon: "💰",
    label: "Financial Efficiency",
    weight: "25%",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    metrics: [
      "Budget utilisation rate (PFMS)",
      "Expenditure vs allocation ratio",
      "Revenue target vs actuals",
      "Fund absorption rate across schemes",
    ],
    source: "PFMS · Finance Dept",
  },
  {
    icon: "🏛️",
    label: "Service Delivery",
    weight: "25%",
    color: "bg-violet-50 border-violet-200",
    badge: "bg-violet-100 text-violet-700",
    metrics: [
      "PGPORTAL grievance resolution rate",
      "NHM healthcare delivery index",
      "Education completion & enrolment",
      "Scheme beneficiary coverage",
    ],
    source: "PGPORTAL · NHM · DISHA",
  },
  {
    icon: "👥",
    label: "Citizen Impact",
    weight: "20%",
    color: "bg-emerald-50 border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    metrics: [
      "Direct beneficiaries per 1 lakh population",
      "Welfare scheme reach (Magalir Urimai etc.)",
      "Public satisfaction survey score",
      "Last-mile delivery effectiveness",
    ],
    source: "DISHA · Scheme portals",
  },
  {
    icon: "🏗️",
    label: "Infrastructure",
    weight: "15%",
    color: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    metrics: [
      "Road connectivity & quality index",
      "Safe drinking water coverage (%)",
      "Electricity access (24×7 supply)",
      "Capital project completion rate",
    ],
    source: "DISHA · PWD · TANGEDCO",
  },
  {
    icon: "⚖️",
    label: "Governance Integrity",
    weight: "15%",
    color: "bg-rose-50 border-rose-200",
    badge: "bg-rose-100 text-rose-700",
    metrics: [
      "CAG audit compliance score",
      "eProcurement transparency ratio",
      "Anomaly flag rate (TN Vettri AI)",
      "Timely submission of utilisation certificates",
    ],
    source: "eProcurement · CAG",
  },
];

export default function ScorecardInfoTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary-700 transition-colors px-2 py-1 rounded-lg hover:bg-primary-50"
        aria-label="How scores are calculated"
      >
        <Info className="w-4 h-4" />
        <span className="hidden sm:inline">How scores are calculated</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between rounded-t-2xl z-10">
              <div>
                <h2 className="text-base font-bold text-slate-900">Scoring Methodology</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Composite Governance Index · Q4 2024 · 38 Districts
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors ml-4"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">

              {/* Formula pill */}
              <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 text-xs font-mono text-slate-700 leading-relaxed">
                <span className="text-slate-400 text-[10px] uppercase tracking-widest font-sans block mb-1">Formula</span>
                <span className="text-primary-700 font-bold">Score</span>
                {" = "}
                <span className="text-blue-600">0.25</span>×Fin
                {" + "}
                <span className="text-violet-600">0.25</span>×Svc
                {" + "}
                <span className="text-emerald-600">0.20</span>×Impact
                {" + "}
                <span className="text-amber-600">0.15</span>×Infra
                {" + "}
                <span className="text-rose-600">0.15</span>×Gov
              </div>

              {/* Category cards */}
              <div className="space-y-3">
                {CATEGORIES.map((cat) => (
                  <div key={cat.label} className={cn("rounded-xl border p-4", cat.color)}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-sm font-semibold text-slate-800">{cat.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", cat.badge)}>
                          Weight {cat.weight}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-1 mb-3">
                      {cat.metrics.map((m) => (
                        <li key={m} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="mt-0.5 w-1 h-1 rounded-full bg-slate-400 flex-shrink-0 mt-1.5" />
                          {m}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                      Source: {cat.source}
                    </p>
                  </div>
                ))}
              </div>

              {/* Grade legend */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Grade Scale</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["A+", "80–100", "bg-emerald-100 text-emerald-700"],
                    ["A",  "70–79",  "bg-blue-100 text-blue-700"],
                    ["B",  "60–69",  "bg-amber-100 text-amber-700"],
                    ["C",  "50–59",  "bg-orange-100 text-orange-700"],
                    ["D",  "<50",    "bg-red-100 text-red-700"],
                  ].map(([g, range, cls]) => (
                    <span key={g} className={cn("text-xs font-bold px-2.5 py-1 rounded-lg border", cls)}>
                      {g} · {range}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                Scores are independently computed from government-published datasets. District rankings are updated quarterly. Data sources: PFMS, PGPORTAL, NHM, DISHA, TN eProcurement portal, CAG reports.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
