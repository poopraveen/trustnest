"use client";

import { useMemo } from "react";
import { Users, ThumbsUp, Phone, HelpCircle, Trash2 } from "lucide-react";
import { WARD_ANALYTICS } from "@/lib/ward-election-analytics";
import { ANALYTICS_META } from "@/lib/ward-election-analytics";
import {
  computeStats,
  VOTER_STATUS_LABELS,
  VOTER_STATUS_COLORS,
  type VoterStatus,
} from "@/lib/ward-campaign";
import { useCampaignStore } from "@/components/ward-election/useCampaignStore";
import { Link } from "@/navigation";

export default function CampaignDashboard() {
  const { statuses, clearAll, ready } = useCampaignStore();

  const globalStats = useMemo(
    () => computeStats(statuses, ANALYTICS_META.totalAnalyzed),
    [statuses]
  );

  const wardBreakdown = useMemo(() => {
    // Group statuses by ward prefix from voter IDs — we need ward from statuses keys
    // Since statuses only have voterId, count globally; ward breakdown shown from analytics + contacted estimate
    return WARD_ANALYTICS.map((w) => {
      const wardVoterIds = Object.keys(statuses).filter((id) => {
        // We'll fetch ward association lazily — for now show analytics baseline
        return true;
      });
      return {
        ward: w.ward,
        analyzed: w.analyzedVoters,
        households: w.households,
      };
    });
  }, [statuses]);

  if (!ready) return null;

  const statusEntries = (Object.entries(globalStats.byStatus) as [VoterStatus, number][])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Voters tracked", value: Object.keys(statuses).length, icon: Users, color: "text-indigo-600 bg-indigo-100" },
          { label: "Contacted", value: `${globalStats.contactedPct}%`, icon: Phone, color: "text-blue-600 bg-blue-100" },
          { label: "Supporters + leaning", value: `${globalStats.supporterPct}%`, icon: ThumbsUp, color: "text-emerald-600 bg-emerald-100" },
          { label: "Undecided", value: globalStats.byStatus.undecided, icon: HelpCircle, color: "text-amber-600 bg-amber-100" },
        ].map((k) => (
          <div key={k.label} className="card p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${k.color}`}>
              <k.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{k.value}</p>
            <p className="text-xs text-slate-500">{k.label}</p>
          </div>
        ))}
      </div>

      {statusEntries.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 mb-4">Sentiment breakdown</h3>
          <div className="flex flex-wrap gap-2">
            {statusEntries.map(([s, n]) => (
              <span key={s} className={`text-sm font-medium px-3 py-1 rounded-full ${VOTER_STATUS_COLORS[s]}`}>
                {VOTER_STATUS_LABELS[s]}: {n}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Ward canvassing targets</h3>
          <button
            type="button"
            onClick={() => { if (confirm("Clear all campaign tracking data?")) clearAll(); }}
            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset tracking
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Part</th>
                <th className="num">Analyzed voters</th>
                <th className="num">Households</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {wardBreakdown.map((w) => (
                <tr key={w.ward}>
                  <td className="font-bold text-slate-400">{w.ward}</td>
                  <td className="num">{w.analyzed.toLocaleString("en-IN")}</td>
                  <td className="num">{w.households.toLocaleString("en-IN")}</td>
                  <td>
                    <Link
                      href={`/ward-election/canvassing?part=${w.ward}`}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Canvass →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Tracking is saved locally in your browser. Use{" "}
          <Link href="/ward-election/canvassing" className="text-indigo-600 hover:underline">Canvassing</Link>{" "}
          to mark voters as you door-knock.
        </p>
      </div>
    </div>
  );
}
