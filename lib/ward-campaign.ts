export type VoterStatus =
  | "unknown"
  | "supporter"
  | "leaning"
  | "undecided"
  | "opposition"
  | "not_home"
  | "contacted";

export const VOTER_STATUS_LABELS: Record<VoterStatus, string> = {
  unknown: "Not contacted",
  supporter: "Supporter",
  leaning: "Leaning our way",
  undecided: "Undecided",
  opposition: "Opposition",
  not_home: "Not home",
  contacted: "Contacted",
};

export const VOTER_STATUS_COLORS: Record<VoterStatus, string> = {
  unknown: "bg-slate-100 text-slate-600",
  supporter: "bg-emerald-100 text-emerald-700",
  leaning: "bg-teal-100 text-teal-700",
  undecided: "bg-amber-100 text-amber-700",
  opposition: "bg-red-100 text-red-700",
  not_home: "bg-slate-200 text-slate-500",
  contacted: "bg-blue-100 text-blue-700",
};

export const POSITIVE_STATUSES: VoterStatus[] = ["supporter", "leaning", "contacted"];

export const STORAGE_KEY = "ward-election-campaign-v1";

export interface CampaignStats {
  total: number;
  byStatus: Record<VoterStatus, number>;
  contactedPct: number;
  supporterPct: number;
}

export function computeStats(statuses: Record<string, VoterStatus>, totalVoters: number): CampaignStats {
  const byStatus: Record<VoterStatus, number> = {
    unknown: 0, supporter: 0, leaning: 0, undecided: 0,
    opposition: 0, not_home: 0, contacted: 0,
  };
  for (const s of Object.values(statuses)) {
    if (s in byStatus) byStatus[s]++;
  }
  const contacted = totalVoters - byStatus.unknown;
  const supporters = byStatus.supporter + byStatus.leaning;
  return {
    total: totalVoters,
    byStatus,
    contactedPct: totalVoters ? Math.round((contacted / totalVoters) * 100) : 0,
    supporterPct: totalVoters ? Math.round((supporters / totalVoters) * 100) : 0,
  };
}
