import { ELECTION_AREAS } from "@/lib/ward-election-areas";
import {
  getElectionMetaForArea,
  getWardsForArea,
  type Ward,
} from "@/lib/ward-election-data";
import {
  ANALYTICS_BY_AREA,
  ANALYTICS_META,
  getAnalyticsByWard,
} from "@/lib/ward-election-analytics";
import { HOUSEHOLD_META, HOUSEHOLDS_BY_AREA } from "@/lib/ward-households";

export interface WardKnowledge {
  partNo: number;
  name: string;
  electorate: number | null;
  male: number | null;
  female: number | null;
  thirdGender: number | null;
  sections: string[] | null;
  pollingStation: string | null;
  pincode: string | null;
  rollPdf: string | null;
  sampleAnalytics: {
    analyzedVoters: number;
    households: number;
    avgAge: number;
    youthPct18_29: number | null;
    seniorPct60plus: number | null;
    femaleShareKnownPct: number | null;
  } | null;
}

export interface AreaKnowledge {
  id: string;
  name: string;
  status: string;
  assemblyConstituency: string;
  totalParts: number;
  totalElectors: number;
  source: string;
  lastUpdated: string;
  wards: WardKnowledge[];
}

export interface WardElectionKnowledge {
  generatedAt: string;
  areas: AreaKnowledge[];
  globalNotes: string[];
  voterSample: {
    totalAnalyzed: number;
    wardsCovered: number;
    householdsInSample: number;
    note: string;
    byArea: Record<string, { totalAnalyzed: number; wardsCovered: number; households: number }>;
  };
}

function summarizeWard(w: Ward): WardKnowledge {
  const part = w.partNo ?? w.number;
  const a = getAnalyticsByWard(part, w.areaId);
  const ageKnown = a
    ? a.ageBands.y18_29 + a.ageBands.a30_44 + a.ageBands.a45_59 + a.ageBands.a60plus + a.ageBands.u18
    : 0;
  const pct = (n: number) => (ageKnown ? Math.round((n / ageKnown) * 100) : null);

  return {
    partNo: part,
    name: w.name,
    electorate: w.electorate ?? null,
    male: w.male ?? null,
    female: w.female ?? null,
    thirdGender: w.thirdGender ?? null,
    sections: w.sections ?? null,
    pollingStation: w.pollingStation ?? null,
    pincode: w.pincode ?? null,
    rollPdf: w.rollPdf ?? null,
    sampleAnalytics: a
      ? {
          analyzedVoters: a.analyzedVoters,
          households: a.households,
          avgAge: a.avgAge,
          youthPct18_29: pct(a.ageBands.y18_29),
          seniorPct60plus: pct(a.ageBands.a60plus),
          femaleShareKnownPct:
            a.male + a.female > 0 ? Math.round((a.female / (a.male + a.female)) * 100) : null,
        }
      : null,
  };
}

/** Structured knowledge for both Veppampattu and Perumalpattu (optionally one area). */
export function buildWardElectionKnowledge(
  areaFilter?: "veppampattu" | "perumalpattu" | "all"
): WardElectionKnowledge {
  const areaIds =
    areaFilter && areaFilter !== "all"
      ? [areaFilter]
      : ELECTION_AREAS.map((a) => a.id);

  const areas: AreaKnowledge[] = areaIds.map((id) => {
    const cfg = ELECTION_AREAS.find((a) => a.id === id)!;
    const meta = getElectionMetaForArea(id);
    const wards = getWardsForArea(id).map(summarizeWard);
    return {
      id,
      name: cfg.name,
      status: cfg.status,
      assemblyConstituency: cfg.assemblyConstituency,
      totalParts: meta.totalWards,
      totalElectors: meta.totalElectors,
      source: meta.source,
      lastUpdated: meta.lastUpdated,
      wards,
    };
  });

  const otherArea = areaFilter && areaFilter !== "all"
    ? ELECTION_AREAS.find((a) => a.id !== areaFilter)
    : null;

  const veppSample = ANALYTICS_BY_AREA.veppampattu?.totalAnalyzed ?? 0;
  const peruSample = ANALYTICS_BY_AREA.perumalpattu?.totalAnalyzed ?? 0;

  const globalNotes = [
    "Official elector counts come from ECI Electoral Roll 2026 (SIR), AC 5 Poonamallee (SC).",
    `Voter-level sample: ${ANALYTICS_META.totalAnalyzed} records total (Veppampattu: ${veppSample}, Perumalpattu: ${peruSample}).`,
    peruSample === 0
      ? "Perumalpattu voter extract not loaded — chat uses official roll totals only for parts 188–197 until data/ward-election/perumalpattu/ward_members.json is filled and npm run ward:gen is run."
      : "Perumalpattu voter sample is loaded — sampleAnalytics on those parts are available.",
    ANALYTICS_META.note,
    `Household canvassing routes: ${HOUSEHOLD_META.totalHouseholds} households (${HOUSEHOLDS_BY_AREA.veppampattu?.totalHouseholds ?? 0} Veppampattu, ${HOUSEHOLDS_BY_AREA.perumalpattu?.totalHouseholds ?? 0} Perumalpattu).`,
    "Veppampattu polling parts: 164–171, 173 (172 roll pending). Perumalpattu: 188, 191–197 (189–190 not in dataset).",
  ];

  if (otherArea && areaFilter !== "all") {
    const otherMeta = getElectionMetaForArea(otherArea.id);
    globalNotes.push(
      `User may also ask about ${otherArea.name}: ${otherMeta.totalWards} parts, ${otherMeta.totalElectors.toLocaleString("en-IN")} electors — switch area or ask for comparison.`
    );
  }

  return {
    generatedAt: new Date().toISOString(),
    areas,
    globalNotes,
    voterSample: {
      totalAnalyzed: ANALYTICS_META.totalAnalyzed,
      wardsCovered: ANALYTICS_META.wardsCovered,
      householdsInSample: HOUSEHOLD_META.totalHouseholds,
      note: ANALYTICS_META.note,
      byArea: Object.fromEntries(
        ELECTION_AREAS.map((a) => [
          a.id,
          {
            totalAnalyzed: ANALYTICS_BY_AREA[a.id]?.totalAnalyzed ?? 0,
            wardsCovered: ANALYTICS_BY_AREA[a.id]?.wardsCovered ?? 0,
            households: HOUSEHOLDS_BY_AREA[a.id]?.totalHouseholds ?? 0,
          },
        ])
      ),
    },
  };
}

export function buildWardElectionSystemPrompt(
  areaFilter?: "veppampattu" | "perumalpattu" | "all"
): string {
  const kb = buildWardElectionKnowledge(areaFilter);
  const focus =
    areaFilter && areaFilter !== "all"
      ? `The user is focused on **${kb.areas[0]?.name}**, but you have data for all loaded areas below.`
      : "You have data for **both Veppampattu and Perumalpattu** town panchayat areas.";

  return `You are the Ward Election AI assistant for TrustNest. ${focus}

You have TOOLS to query live data: voter JSON (ward_members.json), official ward rolls, household routes, and aggregates. Always call the right tool when the user asks about a specific voter name, voter ID, house, counts from JSON, or ward details — do not guess.

RULES:
- Use tool results as the source of truth. Do not invent elector counts or voter names.
- If voter JSON is empty for an area, say so and use official roll data from get_ward_details / list_ward_parts.
- Prefer official roll totals for ward size; label voter JSON results as "sample extract" when partial.
- Answer in a friendly, interactive way: short intro, then bullets or a markdown table when listing voters or wards.
- You may answer in English or Tamil when the user writes in that language.
- After answering, you may suggest 1–2 brief follow-up questions the user could ask next.

SUMMARY KNOWLEDGE (JSON):
${JSON.stringify(kb)}`;
}

/** Quick stats for UI header. */
export function getCombinedElectoralStats() {
  const vepp = getElectionMetaForArea("veppampattu");
  const peru = getElectionMetaForArea("perumalpattu");
  return {
    totalParts: vepp.totalWards + peru.totalWards,
    totalElectors: vepp.totalElectors + peru.totalElectors,
    veppampattu: vepp,
    perumalpattu: peru,
  };
}
