"use client";

import { useMemo, useState } from "react";
import {
  Trophy, Users, Vote, Target, TrendingUp, Flag, Sparkles,
} from "lucide-react";
import { Link } from "@/navigation";

export interface PlanWard {
  id: string;
  name: string;
  number: number;
  partNo?: number;
  electorate: number;
  male: number;
  female: number;
  sections?: string[];
}

const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

export default function WinPlanClient({ wards }: { wards: PlanWard[] }) {
  const [turnout, setTurnout] = useState(70); // expected % turnout
  const [targetShare, setTargetShare] = useState(50); // target vote share %

  const totals = useMemo(() => {
    const electorate = wards.reduce((s, w) => s + w.electorate, 0);
    const male = wards.reduce((s, w) => s + w.male, 0);
    const female = wards.reduce((s, w) => s + w.female, 0);
    const projectedVotes = (electorate * turnout) / 100;
    const majorityToWin = Math.floor(projectedVotes / 2) + 1;
    const targetVotes = (projectedVotes * targetShare) / 100;
    return { electorate, male, female, projectedVotes, majorityToWin, targetVotes };
  }, [wards, turnout, targetShare]);

  // Per-ward projections, sorted by size (impact) descending.
  const rows = useMemo(() => {
    return [...wards]
      .map((w) => {
        const projected = (w.electorate * turnout) / 100;
        const majority = Math.floor(projected / 2) + 1;
        const target = (projected * targetShare) / 100;
        return { ...w, projected, majority, target };
      })
      .sort((a, b) => b.electorate - a.electorate);
  }, [wards, turnout, targetShare]);

  // "Must-win" set: cumulatively take the largest wards until their combined
  // target votes cover 50% of the whole body's target votes.
  const mustWin = useMemo(() => {
    const half = totals.targetVotes / 2;
    let acc = 0;
    const ids = new Set<string>();
    for (const r of rows) {
      if (acc >= half) break;
      acc += r.target;
      ids.add(r.id);
    }
    return ids;
  }, [rows, totals.targetVotes]);

  const maxElectorate = Math.max(...wards.map((w) => w.electorate), 1);
  const femalePct = totals.electorate ? (totals.female / totals.electorate) * 100 : 0;

  const kpis = [
    { label: "Total Electors", value: fmt(totals.electorate), icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: `Projected Votes @ ${turnout}%`, value: fmt(totals.projectedVotes), icon: Vote, color: "text-violet-600 bg-violet-100" },
    { label: "Votes to Win (majority)", value: fmt(totals.majorityToWin), icon: Trophy, color: "text-amber-600 bg-amber-100" },
    { label: `Target Votes @ ${targetShare}%`, value: fmt(totals.targetVotes), icon: Target, color: "text-emerald-600 bg-emerald-100" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Controls ─────────────────────────────────────────────── */}
      <div className="card p-6">
        <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
          <TrendingUp className="w-4 h-4 text-indigo-600" /> Scenario
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">Expected turnout</label>
              <span className="text-sm font-bold text-indigo-700">{turnout}%</span>
            </div>
            <input
              type="range" min={40} max={95} value={turnout}
              onChange={(e) => setTurnout(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">Target vote share</label>
              <span className="text-sm font-bold text-indigo-700">{targetShare}%</span>
            </div>
            <input
              type="range" min={30} max={70} value={targetShare}
              onChange={(e) => setTargetShare(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${k.color}`}>
              <k.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-800 tabular-nums">{k.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── Path to victory ──────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 font-bold text-slate-800">
            <Flag className="w-4 h-4 text-indigo-600" /> Path to Victory
          </h3>
          <span className="text-xs text-slate-500">
            of {fmt(totals.projectedVotes)} projected votes
          </span>
        </div>
        <VictoryBar
          projected={totals.projectedVotes}
          majority={totals.majorityToWin}
          target={totals.targetVotes}
        />
        <p className="text-sm text-slate-600 mt-4">
          To secure a majority you need <strong className="text-slate-900">{fmt(totals.majorityToWin)}</strong> votes.
          Your {targetShare}% target is <strong className="text-emerald-700">{fmt(totals.targetVotes)}</strong> votes —{" "}
          {(() => {
            const diff = Math.round(totals.targetVotes - totals.majorityToWin);
            if (diff > 0)
              return (
                <span className="text-emerald-700 font-medium">
                  comfortably above the line (+{fmt(diff)}).
                </span>
              );
            if (diff === 0)
              return (
                <span className="text-amber-600 font-medium">
                  right on the majority line — push turnout or share higher for a safety margin.
                </span>
              );
            return (
              <span className="text-red-600 font-medium">
                {fmt(-diff)} short of a majority.
              </span>
            );
          })()}
        </p>
      </div>

      {/* ── Electorate by ward + gender ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-bold text-slate-800 mb-4">Electorate by ward</h3>
          <div className="space-y-2.5">
            {rows.map((w) => {
              const pct = (w.electorate / maxElectorate) * 100;
              const targetPct = (w.target / w.electorate) * 100;
              return (
                <div key={w.id} className="flex items-center gap-3">
                  <span className="w-14 text-xs font-semibold text-slate-500 shrink-0">
                    P-{w.partNo ?? w.number}
                  </span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden relative">
                    <div
                      className="h-full bg-indigo-200 rounded-md transition-all"
                      style={{ width: `${pct}%` }}
                    />
                    <div
                      className="absolute top-0 left-0 h-full bg-indigo-600 rounded-md transition-all"
                      style={{ width: `${(pct * targetPct) / 100}%` }}
                      title={`Target votes: ${fmt(w.target)}`}
                    />
                  </div>
                  <span className="w-16 text-xs font-bold text-slate-700 text-right tabular-nums shrink-0">
                    {fmt(w.electorate)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> Target votes</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-200 inline-block" /> Electorate</span>
          </div>
        </div>

        <div className="card p-6 flex flex-col items-center">
          <h3 className="font-bold text-slate-800 mb-4 self-start">Gender mix</h3>
          <Donut femalePct={femalePct} />
          <div className="flex gap-4 mt-4 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              Female {fmt(totals.female)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              Male {fmt(totals.male)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Must-win wards table ─────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="flex items-center gap-2 font-bold text-slate-800">
              <Trophy className="w-4 h-4 text-amber-500" /> Ward priority &amp; must-win set
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Highlighted wards form the high-impact core that delivers half of your target votes.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Part</th>
                <th>Ward</th>
                <th className="num">Electors</th>
                <th className="num">Projected</th>
                <th className="num">Majority</th>
                <th className="num">Target</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => {
                const isCore = mustWin.has(w.id);
                return (
                  <tr key={w.id} className={isCore ? "bg-amber-50" : ""}>
                    <td className="font-bold text-slate-400">{w.partNo ?? w.number}</td>
                    <td className="font-medium text-slate-800">{w.name}</td>
                    <td className="num">{fmt(w.electorate)}</td>
                    <td className="num text-slate-600">{fmt(w.projected)}</td>
                    <td className="num text-slate-600">{fmt(w.majority)}</td>
                    <td className="num font-semibold text-emerald-700">{fmt(w.target)}</td>
                    <td>
                      {isCore ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                          Must-win
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          Support
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6 bg-gradient-to-br from-indigo-50 to-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800">Turn this into a campaign playbook</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Generate ward-by-ward messaging, resourcing and risk plans with AI.
          </p>
        </div>
        <Link
          href="/ward-election/strategy"
          className="inline-flex items-center gap-2 bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-800 transition-colors shrink-0"
        >
          <Sparkles className="w-4 h-4" /> Generate AI Strategy
        </Link>
      </div>
    </div>
  );
}

function VictoryBar({ projected, majority, target }: { projected: number; majority: number; target: number }) {
  const majorityLeft = projected ? (majority / projected) * 100 : 50;
  const targetWidth = projected ? Math.min((target / projected) * 100, 100) : 0;
  const reached = target >= majority;
  return (
    <div className="relative h-10 bg-slate-100 rounded-lg overflow-hidden">
      <div
        className={`h-full rounded-lg transition-all ${reached ? "bg-emerald-500" : "bg-indigo-500"}`}
        style={{ width: `${targetWidth}%` }}
      />
      {/* majority threshold marker */}
      <div
        className="absolute top-0 h-full border-l-2 border-dashed border-amber-600"
        style={{ left: `${majorityLeft}%` }}
      >
        <span className="absolute -top-0.5 left-1 text-[10px] font-bold text-amber-700 whitespace-nowrap">
          50% line
        </span>
      </div>
    </div>
  );
}

function Donut({ femalePct }: { femalePct: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const femaleLen = (femalePct / 100) * c;
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
      <circle cx="75" cy="75" r={r} fill="none" stroke="#3b82f6" strokeWidth="18" />
      <circle
        cx="75" cy="75" r={r} fill="none" stroke="#f43f5e" strokeWidth="18"
        strokeDasharray={`${femaleLen} ${c - femaleLen}`}
      />
      <text x="75" y="75" textAnchor="middle" dominantBaseline="central"
        className="rotate-90" transform="rotate(90 75 75)"
        style={{ fontSize: 18, fontWeight: 700, fill: "#1e293b" }}>
        {Math.round(femalePct)}%
      </text>
    </svg>
  );
}
