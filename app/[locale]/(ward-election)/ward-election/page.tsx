import type { Metadata } from "next";
import { Link } from "@/navigation";
import {
  Vote, MapPin, Users, BarChart3, Clock, Sparkles, FileText,
} from "lucide-react";
import { ELECTION_META, WARDS, CANDIDATES } from "@/lib/ward-election-data";

export const metadata: Metadata = {
  title: "Ward Election | TrustNest",
  description: "Ward-level election data, candidates, turnout and results.",
};

const stats = [
  { value: ELECTION_META.totalWards.toLocaleString("en-IN"), label: "Wards", labelTa: "வார்டுகள்" },
  { value: ELECTION_META.totalElectors.toLocaleString("en-IN"), label: "Electors", labelTa: "வாக்காளர்கள்" },
  { value: CANDIDATES.length.toLocaleString("en-IN"), label: "Candidates", labelTa: "வேட்பாளர்கள்" },
];

const quickLinks = [
  { href: "/ward-election", icon: MapPin, label: "Wards", labelTa: "வார்டுகள்", color: "bg-blue-100 text-blue-700" },
  { href: "/ward-election", icon: Users, label: "Candidates", labelTa: "வேட்பாளர்கள்", color: "bg-emerald-100 text-emerald-700" },
  { href: "/ward-election", icon: BarChart3, label: "Results", labelTa: "முடிவுகள்", color: "bg-amber-100 text-amber-700" },
  { href: "/ward-election", icon: Vote, label: "Turnout", labelTa: "வாக்குப்பதிவு", color: "bg-violet-100 text-violet-700" },
  { href: "/ward-election/strategy", icon: Sparkles, label: "AI Strategy", labelTa: "உத்தி", color: "bg-indigo-100 text-indigo-700" },
];

export default function WardElectionHomePage() {
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
              Explore wards, candidates, turnout and results — backed by verifiable, sourced data.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-8 text-center">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-12">Part</th>
                  <th>Ward / Sections</th>
                  <th>Polling Station</th>
                  <th className="num">Male</th>
                  <th className="num">Female</th>
                  <th className="num">Electors</th>
                  <th>Roll</th>
                </tr>
              </thead>
              <tbody>
                {WARDS.map((w) => (
                  <tr key={w.id}>
                    <td className="font-bold text-slate-400">{w.partNo ?? w.number}</td>
                    <td className="font-medium text-slate-800 max-w-xs">
                      {w.name}
                      {w.sections && w.sections.length > 0 && (
                        <span className="block text-xs text-slate-400 mt-0.5">
                          {w.sections.join(" · ")}
                        </span>
                      )}
                    </td>
                    <td className="text-slate-600 max-w-xs">{w.pollingStation ?? "—"}</td>
                    <td className="num">{w.male?.toLocaleString("en-IN") ?? "—"}</td>
                    <td className="num">{w.female?.toLocaleString("en-IN") ?? "—"}</td>
                    <td className="num font-semibold">{w.electorate?.toLocaleString("en-IN") ?? "—"}</td>
                    <td>
                      {w.rollPdf ? (
                        <a
                          href={w.rollPdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          <FileText className="w-3.5 h-3.5" /> PDF
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-slate-700 border-t-2 border-slate-200">
                  <td colSpan={3} className="text-right pr-4">Total</td>
                  <td className="num">{WARDS.reduce((s, w) => s + (w.male ?? 0), 0).toLocaleString("en-IN")}</td>
                  <td className="num">{WARDS.reduce((s, w) => s + (w.female ?? 0), 0).toLocaleString("en-IN")}</td>
                  <td className="num">{ELECTION_META.totalElectors.toLocaleString("en-IN")}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <p className="trust-strip mt-4">
          <Clock className="w-3 h-3" />
          <span>Source: {ELECTION_META.source} · Updated {ELECTION_META.lastUpdated}</span>
        </p>
      </section>
    </div>
  );
}
