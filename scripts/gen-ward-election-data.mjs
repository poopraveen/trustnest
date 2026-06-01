import fs from "fs";
import path from "path";

const SRC = path.join(process.cwd(), "data/ward-election/ward_members.json");
const ANALYTICS_OUT = path.join(process.cwd(), "lib/ward-election-analytics.ts");
const HOUSEHOLDS_OUT = path.join(process.cwd(), "lib/ward-households.ts");

const data = JSON.parse(fs.readFileSync(SRC, "utf8"));

function ageBand(a) {
  const n = parseFloat(a);
  if (Number.isNaN(n)) return null;
  if (n < 18) return "u18";
  if (n <= 29) return "y18_29";
  if (n <= 44) return "a30_44";
  if (n <= 59) return "a45_59";
  return "a60plus";
}

// ─── Analytics ───────────────────────────────────────────────────────────────
const wards = new Map();
for (const r of data) {
  const w = r.Ward;
  if (!wards.has(w)) {
    wards.set(w, {
      ward: w, count: 0, male: 0, female: 0, other: 0, gmiss: 0, amiss: 0,
      bands: { u18: 0, y18_29: 0, a30_44: 0, a45_59: 0, a60plus: 0 },
      houses: new Set(), ageSum: 0, ageN: 0,
    });
  }
  const d = wards.get(w);
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
    if (!Number.isNaN(age)) { d.ageSum += age; d.ageN++; }
  }
  const h = String(r.House_Number || "").trim();
  if (h) d.houses.add(h);
}

const analyticsRows = [...wards.values()]
  .sort((a, b) => a.ward - b.ward)
  .map((d) => ({
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

fs.writeFileSync(
  ANALYTICS_OUT,
  `// AUTO-GENERATED from data/ward-election/ward_members.json
// Regenerate: node scripts/gen-ward-election-data.mjs

export interface AgeBands {
  u18: number; y18_29: number; a30_44: number; a45_59: number; a60plus: number;
}

export interface WardAnalytics {
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

export function getAnalyticsByWard(ward: number): WardAnalytics | undefined {
  return WARD_ANALYTICS.find((w) => w.ward === ward);
}
`
);

// ─── Households (canvassing routes) ──────────────────────────────────────────
const byWardHouse = new Map();
for (const r of data) {
  const w = r.Ward;
  const h = String(r.House_Number || "").trim() || "Unknown";
  const key = `${w}::${h}`;
  if (!byWardHouse.has(key)) {
    byWardHouse.set(key, { ward: w, house: h, voters: 0, hasYouth: false, hasSenior: false });
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
  .sort((a, b) => a.ward - b.ward || a.house.localeCompare(b.house, "en", { numeric: true }))
  .map(({ ward, house, voters, hasYouth, hasSenior }) => ({
    ward, house, voters, hasYouth, hasSenior,
  }));

const totalHouseholds = householdRows.length;

fs.writeFileSync(
  HOUSEHOLDS_OUT,
  `// AUTO-GENERATED from data/ward-election/ward_members.json
// Regenerate: node scripts/gen-ward-election-data.mjs

export interface HouseholdRoute {
  ward: number;
  house: string;
  voters: number;
  hasYouth: boolean;
  hasSenior: boolean;
}

export const HOUSEHOLD_ROUTES: HouseholdRoute[] = ${JSON.stringify(householdRows, null, 2)};

export const HOUSEHOLD_META = {
  totalHouseholds: ${totalHouseholds},
  wardsCovered: ${analyticsRows.length},
};

export function getHouseholdsByWard(ward: number): HouseholdRoute[] {
  return HOUSEHOLD_ROUTES.filter((h) => h.ward === ward);
}

export function getHouseholdCountByWard(ward: number): number {
  return HOUSEHOLD_ROUTES.filter((h) => h.ward === ward).length;
}
`
);

console.log("Generated analytics:", analyticsRows.length, "wards,", totalAnalyzed, "voters");
console.log("Generated households:", totalHouseholds);
