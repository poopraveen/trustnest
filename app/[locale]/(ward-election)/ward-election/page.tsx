import type { Metadata } from "next";
import { Link } from "@/navigation";
import {
  Vote, Clock, Sparkles, Trophy, ClipboardList, BarChart3, Map, MapPin, Bot,
} from "lucide-react";
import { getElectionMetaForArea, getWardsForArea } from "@/lib/ward-election-data";
import { resolveAreaId } from "@/lib/ward-election-areas";
import { wardElectionHref } from "@/lib/ward-election-areas";
import { ANALYTICS_META } from "@/lib/ward-election-analytics";
import { HOUSEHOLD_META } from "@/lib/ward-households";
import WardRollsTable from "@/components/ward-election/WardRollsTable";

export const metadata: Metadata = {
  title: "Ward Election | TrustNest",
  description: "Ward-level election data, candidates, turnout and results.",
};

const quickLinksBase = [
  { href: "/ward-election/chat", icon: Bot, label: "AI Chat", labelTa: "சாட்", color: "bg-indigo-100 text-indigo-700" },
  { href: "/ward-election/map", icon: Map, label: "Ward Map", labelTa: "வரைபடம்", color: "bg-teal-100 text-teal-700" },
  { href: "/ward-election/plan", icon: Trophy, label: "Win Plan", labelTa: "வெற்றித் திட்டம்", color: "bg-amber-100 text-amber-700" },
  { href: "/ward-election/canvassing", icon: ClipboardList, label: "Canvassing", labelTa: "வீடு வீடா", color: "bg-emerald-100 text-emerald-700" },
  { href: "/ward-election/campaign", icon: BarChart3, label: "Campaign", labelTa: "பிரச்சாரம்", color: "bg-blue-100 text-blue-700" },
  { href: "/ward-election/turnout", icon: Vote, label: "GOTV", labelTa: "வாக்குப்பதிவு", color: "bg-violet-100 text-violet-700" },
  { href: "/ward-election/strategy", icon: Sparkles, label: "AI Strategy", labelTa: "உத்தி", color: "bg-indigo-100 text-indigo-700" },
];

export default function WardElectionHomePage({
  searchParams,
}: {
  searchParams: { area?: string };
}) {
  const areaId = resolveAreaId(searchParams.area);
  const ELECTION_META = getElectionMetaForArea(areaId);
  const WARDS = getWardsForArea(areaId);
  const quickLinks = quickLinksBase.map((q) => ({
    ...q,
    href: wardElectionHref(q.href, areaId),
  }));
  const stats = [
    { value: ELECTION_META.totalWards.toLocaleString("en-IN"), label: "Parts", labelTa: "பாகங்கள்" },
    { value: ELECTION_META.totalElectors.toLocaleString("en-IN"), label: "Electors", labelTa: "வாக்காளர்கள்" },
    { value: HOUSEHOLD_META.totalHouseholds.toLocaleString("en-IN"), label: "Households", labelTa: "வீடுகள்" },
    { value: ANALYTICS_META.totalAnalyzed.toLocaleString("en-IN"), label: "Voters mapped", labelTa: "வாக்காளர்கள்" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-indigo-700">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Vote className="w-4 h-4 text-yellow-300" />
              <span>{ELECTION_META.body}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
              {ELECTION_META.title}
              <br />
              <span className="text-yellow-300">Ward-Level Insights</span>
            </h1>
            <p className="text-indigo-100 text-base max-w-2xl mx-auto mt-3">
              Plan to win — ward data, household routes, campaign tracking, turnout &amp; AI strategy.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-10 text-center">
            {stats.map((s) => (
              <div key={s.label} className="text-white">
                <div className="text-2xl font-bold font-data">{s.value}</div>
                <div className="text-indigo-200 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-indigo-50 to-white">
        <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {quickLinks.map((q, i) => (
              <Link
                key={`${q.label}-${i}`}
                href={q.href}
                className="card p-4 text-center hover:border-primary-200 border border-transparent transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${q.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <q.icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-sm text-slate-700 group-hover:text-primary-700 transition-colors">
                  {q.label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 font-tamil">{q.labelTa}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">Wards</h2>
            <p className="section-subtitle">{ELECTION_META.body} · {ELECTION_META.electionDate}</p>
          </div>
        </div>

        {WARDS.length === 0 ? (
          <div className="card p-10 text-center">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No ward data yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Add records to <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">lib/ward-election-data.ts</code> as you extract them.
            </p>
          </div>
        ) : (
          <WardRollsTable
            areaId={areaId}
            wards={WARDS.map((w) => ({
              id: w.id,
              name: w.name,
              number: w.number,
              partNo: w.partNo,
              sections: w.sections,
              pollingStation: w.pollingStation,
              male: w.male,
              female: w.female,
              electorate: w.electorate,
              rollPdf: w.rollPdf,
            }))}
          />
        )}

        <p className="trust-strip mt-4">
          <Clock className="w-3 h-3" />
          <span>Source: {ELECTION_META.source} · Updated {ELECTION_META.lastUpdated}</span>
        </p>
      </section>
    </div>
  );
}
