"use client";

import { useMemo, useState } from "react";
import { Vote, CheckSquare, Square, Target, AlertCircle } from "lucide-react";
import { WARDS } from "@/lib/ward-election-data";
import { Link } from "@/navigation";

const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

const CHECKLIST = [
  "Confirm polling agents at each booth",
  "Morning SMS/WhatsApp to supporters",
  "Transport arranged for senior voters",
  "Identify low-turnout wards — extra volunteers",
  "Track hourly booth turnout (if available)",
  "Final push 3–5 PM for undecided households",
  "Thank supporters post close of polls",
];

export default function TurnoutClient() {
  const [turnout, setTurnout] = useState(72);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const totals = useMemo(() => {
    const electorate = WARDS.reduce((s, w) => s + (w.electorate ?? 0), 0);
    const projected = (electorate * turnout) / 100;
    const majority = Math.floor(projected / 2) + 1;
    return { electorate, projected, majority };
  }, [turnout]);

  const wardTargets = useMemo(() => {
    return [...WARDS]
      .map((w) => {
        const elec = w.electorate ?? 0;
        const projected = (elec * turnout) / 100;
        const need50 = Math.floor(projected / 2) + 1;
        const need55 = Math.ceil(projected * 0.55);
        return { ...w, projected, need50, need55 };
      })
      .sort((a, b) => (b.electorate ?? 0) - (a.electorate ?? 0));
  }, [turnout]);

  const toggleCheck = (i: number) =>
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));

  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
          <Vote className="w-4 h-4 text-indigo-600" /> Expected turnout
        </h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600">Election day turnout forecast</span>
          <span className="text-lg font-bold text-indigo-700">{turnout}%</span>
        </div>
        <input
          type="range" min={50} max={90} value={turnout}
          onChange={(e) => setTurnout(Number(e.target.value))}
          className="w-full accent-indigo-600"
        />
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-xl font-bold text-slate-800">{fmt(totals.electorate)}</p>
            <p className="text-xs text-slate-500">Registered</p>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <p className="text-xl font-bold text-indigo-800">{fmt(totals.projected)}</p>
            <p className="text-xs text-indigo-600">Expected votes</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <p className="text-xl font-bold text-amber-800">{fmt(totals.majority)}</p>
            <p className="text-xs text-amber-600">Majority line</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            Election day checklist
            <span className="text-xs font-normal text-slate-400 ml-auto">{doneCount}/{CHECKLIST.length}</span>
          </h3>
          <ul className="space-y-2">
            {CHECKLIST.map((item, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => toggleCheck(i)}
                  className="flex items-start gap-2 w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2 rounded-lg"
                >
                  {checked[i] ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <span className={checked[i] ? "line-through text-slate-400" : ""}>{item}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-2">
            <Target className="w-4 h-4 text-indigo-600" /> GOTV priorities
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Focus turnout effort on largest parts first. Targets assume {turnout}% turnout.
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {wardTargets.slice(0, 6).map((w) => (
              <div key={w.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-sm">
                <span className="font-medium text-slate-700">Part {w.partNo}</span>
                <span className="text-slate-500">{fmt(w.electorate ?? 0)} electors</span>
                <span className="text-emerald-700 font-semibold">{fmt(w.need55)} @55%</span>
              </div>
            ))}
          </div>
          <Link
            href="/ward-election/canvassing"
            className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            Open canvassing routes →
          </Link>
        </div>
      </div>

      <div className="card p-6 bg-amber-50 border border-amber-100">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">GOTV tip</p>
            <p className="text-sm text-amber-800 mt-0.5">
              Mark supporters in{" "}
              <Link href="/ward-election/canvassing" className="underline">Canvassing</Link>, then
              on election day call/text every supporter marked in Parts {wardTargets.slice(0, 3).map((w) => w.partNo).join(", ")} first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
