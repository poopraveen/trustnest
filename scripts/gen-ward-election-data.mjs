/**
 * Generate ward analytics + household routes from voter JSON extracts.
 *
 * Usage:
 *   npm run ward:gen              # merge all areas (recommended)
 *   npm run ward:gen -- veppampattu
 *   npm run ward:gen -- perumalpattu
 *   npm run ward:gen -- all
 */
import fs from "fs";
import path from "path";

const VOTER_PATHS = {
  veppampattu: "data/ward-election/ward_members.json",
  perumalpattu: "data/ward-election/perumalpattu/ward_members.json",
};

const areaArg = process.argv[2] || "all";
const areasToLoad =
  areaArg === "all" ? Object.keys(VOTER_PATHS) : [areaArg];

if (!areasToLoad.every((a) => VOTER_PATHS[a])) {
  console.error(`Unknown area "${areaArg}". Use: all | veppampattu | perumalpattu`);
  process.exit(1);
}

function loadAreaData(areaId) {
  const rel = VOTER_PATHS[areaId];
  const file = path.join(process.cwd(), rel);
  if (!fs.existsSync(file)) {
    console.warn(`[skip] ${areaId}: file not found (${rel})`);
    return [];
  }
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(raw)) {
    console.warn(`[skip] ${areaId}: expected JSON array in ${rel}`);
    return [];
  }
  if (raw.length === 0) {
    console.warn(`[skip] ${areaId}: empty array in ${rel} — add voter extract then re-run`);
    return [];
  }
  console.log(`[load] ${areaId}: ${raw.length} records ← ${rel}`);
  return raw.map((r) => ({ ...r, _areaId: areaId }));
}

const data = areasToLoad.flatMap(loadAreaData);

if (data.length === 0) {
  console.error(
    "No voter records loaded. Add JSON to data/ward-election/ward_members.json and/or data/ward-election/perumalpattu/ward_members.json"
  );
  process.exit(1);
}

const ANALYTICS_OUT = path.join(process.cwd(), "lib/ward-election-analytics.ts");
const HOUSEHOLDS_OUT = path.join(process.cwd(), "lib/ward-households.ts");

function ageBand(a) {
  const n = parseFloat(a);
  if (Number.isNaN(n)) return null;
  if (n < 18) return "u18";
  if (n <= 29) return "y18_29";
  if (n <= 44) return "a30_44";
  if (n <= 59) return "a45_59";
  return "a60plus";
}

// ─── Analytics (keyed by area + part) ────────────────────────────────────────
const wards = new Map();
for (const r of data) {
  const areaId = r._areaId;
  const w = r.Ward;
  const key = `${areaId}::${w}`;
  if (!wards.has(key)) {
    wards.set(key, {
      areaId,
      ward: w,
      count: 0,
      male: 0,
      female: 0,
      other: 0,
      gmiss: 0,
      amiss: 0,
      bands: { u18: 0, y18_29: 0, a30_44: 0, a45_59: 0, a60plus: 0 },
      houses: new Set(),
      ageSum: 0,
      ageN: 0,
    });
  }
  const d = wards.get(key);
  d.count++;
  const g = (r.Gender || "").trim().toLowerCase();
  if (g === "male") d.male++;
  else if (g === "female") d.female++;
  else if (!g) d.gmiss++;
  else d.other++;
  const b = ageBand(r.Age);
  if (!b) d.amiss++;
  else {
    d.bands[b]++;
    const age = parseFloat(r.Age);
    if (!Number.isNaN(age)) {
      d.ageSum += age;
      d.ageN++;
    }
  }
  const h = String(r.House_Number || "").trim();
  if (h) d.houses.add(h);
}

const analyticsRows = [...wards.values()]
  .sort((a, b) => a.areaId.localeCompare(b.areaId) || a.ward - b.ward)
  .map((d) => ({
    areaId: d.areaId,
    ward: d.ward,
    analyzedVoters: d.count,
    male: d.male,
    female: d.female,
    other: d.other,
    genderMissing: d.gmiss,
    ageMissing: d.amiss,
    avgAge: d.ageN ? Math.round((d.ageSum / d.ageN) * 10) / 10 : 0,
    households: d.houses.size,
    ageBands: d.bands,
  }));

const totalAnalyzed = analyticsRows.reduce((s, r) => s + r.analyzedVoters, 0);
const byArea = {};
for (const id of Object.keys(VOTER_PATHS)) {
  const rows = analyticsRows.filter((r) => r.areaId === id);
  byArea[id] = {
    totalAnalyzed: rows.reduce((s, r) => s + r.analyzedVoters, 0),
    wardsCovered: rows.length,
  };
}

fs.writeFileSync(
  ANALYTICS_OUT,
  `// AUTO-GENERATED — do not edit by hand
// Regenerate: npm run ward:gen   (merges veppampattu + perumalpattu voter JSON)

export interface AgeBands {
  u18: number; y18_29: number; a30_44: number; a45_59: number; a60plus: number;
}

export interface WardAnalytics {
  areaId: string;
  ward: number;
  analyzedVoters: number;
  male: number;
  female: number;
  other: number;
  genderMissing: number;
  ageMissing: number;
  avgAge: number;
  households: number;
  ageBands: AgeBands;
}

export const WARD_ANALYTICS: WardAnalytics[] = ${JSON.stringify(analyticsRows, null, 2)};

export const ANALYTICS_META = {
  totalAnalyzed: ${totalAnalyzed},
  wardsCovered: ${analyticsRows.length},
  source: "Voter-level extract of ECI Electoral Roll 2026 (SIR), AC 5 Poonamallee",
  note: "Partial OCR extract; some records have missing age/gender. Use official roll totals for electorate size.",
};

export const ANALYTICS_BY_AREA: Record<string, { totalAnalyzed: number; wardsCovered: number }> = ${JSON.stringify(byArea, null, 2)};

export function getAnalyticsByWard(ward: number, areaId?: string): WardAnalytics | undefined {
  return WARD_ANALYTICS.find(
    (w) => w.ward === ward && (areaId == null || w.areaId === areaId)
  );
}

export function getAnalyticsForArea(areaId: string): WardAnalytics[] {
  return WARD_ANALYTICS.filter((w) => w.areaId === areaId);
}
`
);

// ─── Households ──────────────────────────────────────────────────────────────
const byWardHouse = new Map();
for (const r of data) {
  const areaId = r._areaId;
  const w = r.Ward;
  const h = String(r.House_Number || "").trim() || "Unknown";
  const key = `${areaId}::${w}::${h}`;
  if (!byWardHouse.has(key)) {
    byWardHouse.set(key, {
      areaId,
      ward: w,
      house: h,
      voters: 0,
      hasYouth: false,
      hasSenior: false,
    });
  }
  const row = byWardHouse.get(key);
  row.voters++;
  const age = parseFloat(r.Age);
  if (!Number.isNaN(age)) {
    if (age <= 29) row.hasYouth = true;
    if (age >= 60) row.hasSenior = true;
  }
}

const householdRows = [...byWardHouse.values()]
  .sort(
    (a, b) =>
      a.areaId.localeCompare(b.areaId) ||
      a.ward - b.ward ||
      a.house.localeCompare(b.house, "en", { numeric: true })
  )
  .map(({ areaId, ward, house, voters, hasYouth, hasSenior }) => ({
    areaId,
    ward,
    house,
    voters,
    hasYouth,
    hasSenior,
  }));

const totalHouseholds = householdRows.length;
const householdsByArea = {};
for (const id of Object.keys(VOTER_PATHS)) {
  const rows = householdRows.filter((h) => h.areaId === id);
  householdsByArea[id] = {
    totalHouseholds: rows.length,
    wardsCovered: new Set(rows.map((r) => r.ward)).size,
  };
}

fs.writeFileSync(
  HOUSEHOLDS_OUT,
  `// AUTO-GENERATED — do not edit by hand
// Regenerate: npm run ward:gen

export interface HouseholdRoute {
  areaId: string;
  ward: number;
  house: string;
  voters: number;
  hasYouth: boolean;
  hasSenior: boolean;
}

export const HOUSEHOLD_ROUTES: HouseholdRoute[] = ${JSON.stringify(householdRows, null, 2)};

export const HOUSEHOLD_META = {
  totalHouseholds: ${totalHouseholds},
  wardsCovered: ${new Set(householdRows.map((h) => `${h.areaId}::${h.ward}`)).size},
};

export const HOUSEHOLDS_BY_AREA: Record<string, { totalHouseholds: number; wardsCovered: number }> = ${JSON.stringify(householdsByArea, null, 2)};

export function getHouseholdsByWard(ward: number, areaId?: string): HouseholdRoute[] {
  return HOUSEHOLD_ROUTES.filter(
    (h) => h.ward === ward && (areaId == null || h.areaId === areaId)
  );
}

export function getHouseholdCountByWard(ward: number, areaId?: string): number {
  return getHouseholdsByWard(ward, areaId).length;
}
`
);

console.log("\nDone.");
console.log("  Analytics:", analyticsRows.length, "ward-parts,", totalAnalyzed, "voters");
for (const [id, m] of Object.entries(byArea)) {
  console.log(`    ${id}:`, m.wardsCovered, "parts,", m.totalAnalyzed, "voters");
}
console.log("  Households:", totalHouseholds);
