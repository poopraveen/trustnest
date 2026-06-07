import { Link } from "@/navigation";
import {
  MapPin, Users, Home, Cake, FileText, Trophy, ClipboardList,
} from "lucide-react";
import { getWardByPart } from "@/lib/ward-election-data";
import { getAnalyticsByWard } from "@/lib/ward-election-analytics";
import { getHouseholdCountByWard } from "@/lib/ward-households";
import VoterAnalytics from "@/components/ward-election/VoterAnalytics";

const fmt = (n: number) => n.toLocaleString("en-IN");

export default function WardDetailView({
  part,
  areaId = "veppampattu",
}: {
  part: number;
  areaId?: string;
}) {
  const ward = getWardByPart(part, areaId);
  const analytics = getAnalyticsByWard(part, areaId);
  const households = getHouseholdCountByWard(part, areaId);

  if (!ward && !analytics) {
    return (
      <div className="card p-10 text-center">
        <p className="text-slate-600">Part {part} not found.</p>
        <Link href="/ward-election" className="text-indigo-600 text-sm mt-2 inline-block">← Back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-indigo-600 font-medium">Part {part}</p>
          <h1 className="text-2xl font-bold text-slate-800">{ward?.name ?? `Veppampattu — Part ${part}`}</h1>
          {ward?.pollingStation && (
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {ward.pollingStation}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/ward-election/canvassing?part=${part}`}
            className="inline-flex items-center gap-1.5 bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-800">
            <ClipboardList className="w-4 h-4" /> Canvass
          </Link>
          {ward?.rollPdf && (
            <a href={ward.rollPdf} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border border-slate-200 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50">
              <FileText className="w-4 h-4" /> Roll PDF
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ward?.electorate != null && (
          <StatCard icon={Users} label="Official electors" value={fmt(ward.electorate)} color="bg-blue-100 text-blue-700" />
        )}
        {analytics && (
          <>
            <StatCard icon={Home} label="Households (route)" value={fmt(households)} color="bg-emerald-100 text-emerald-700" />
            <StatCard icon={Users} label="Analyzed voters" value={fmt(analytics.analyzedVoters)} color="bg-violet-100 text-violet-700" />
            <StatCard icon={Cake} label="Avg age (sample)" value={String(analytics.avgAge)} color="bg-amber-100 text-amber-700" />
          </>
        )}
      </div>

      {ward?.sections && ward.sections.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-2">Sections covered</h3>
          <ul className="flex flex-wrap gap-2">
            {ward.sections.map((s) => (
              <li key={s} className="text-sm bg-slate-100 text-slate-700 px-3 py-1 rounded-full">{s}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/ward-election/plan" className="card p-4 hover:border-indigo-200 transition-colors group">
          <Trophy className="w-5 h-5 text-amber-500 mb-2" />
          <p className="font-semibold text-slate-800 group-hover:text-indigo-700">Win Plan</p>
          <p className="text-xs text-slate-500">Votes needed & must-win set</p>
        </Link>
        <Link href={`/ward-election/canvassing?part=${part}`} className="card p-4 hover:border-indigo-200 transition-colors group">
          <ClipboardList className="w-5 h-5 text-indigo-500 mb-2" />
          <p className="font-semibold text-slate-800 group-hover:text-indigo-700">Canvassing</p>
          <p className="text-xs text-slate-500">{households} households to visit</p>
        </Link>
        <Link href="/ward-election/strategy" className="card p-4 hover:border-indigo-200 transition-colors group">
          <FileText className="w-5 h-5 text-violet-500 mb-2" />
          <p className="font-semibold text-slate-800 group-hover:text-indigo-700">AI Strategy</p>
          <p className="text-xs text-slate-500">Generate ward playbook</p>
        </Link>
      </div>

      {!ward?.rollPdf && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
          Official roll PDF not yet uploaded for Part {part}. Demographics below are from the analyzed voter sample.
        </p>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, color,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return (
    <div className="card p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
