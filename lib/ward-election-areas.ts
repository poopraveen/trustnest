// Election areas (town panchayat / campaign zones).
// To add a new area (e.g. Perumalpattu):
//   1. Add an entry below with id, center coordinates, and data paths.
//   2. Add wards in lib/ward-election-data.ts with matching areaId.
//   3. Add map pins in lib/ward-election-map.ts.
//   4. Place voter JSON at data/ward-election/{id}/ward_members.json
//   5. Place roll PDFs at public/ward-election/{id}/rolls/
//   6. Run: npm run ward:gen  (merges all areas; or ward:gen:perumalpattu)

export type AreaStatus = "active" | "planned" | "draft";

export interface ElectionArea {
  id: string;
  name: string;
  nameTa?: string;
  subtitle: string;
  assemblyConstituency: string;
  district: string;
  pincode?: string;
  status: AreaStatus;
  /** Map viewport */
  center: { lat: number; lng: number };
  zoom: number;
  /** Relative path under /public for electoral roll PDFs */
  rollsPublicPath: string;
  /** Relative path under project root for voter JSON */
  voterDataPath: string;
  electionDate: string;
  source: string;
  lastUpdated: string;
}

export const ELECTION_AREAS: ElectionArea[] = [
  {
    id: "veppampattu",
    name: "Veppampattu",
    nameTa: "வேப்பம்பட்டு",
    subtitle: "Town Panchayat — Poonamallee (SC) AC",
    assemblyConstituency: "5 - Poonamallee (SC)",
    district: "Thiruvallur",
    pincode: "602025",
    status: "active",
    center: { lat: 13.1232, lng: 79.9684 },
    zoom: 14,
    rollsPublicPath: "/ward-election/rolls",
    voterDataPath: "data/ward-election/ward_members.json",
    electionDate: "TBD",
    source: "ECI Electoral Roll 2026 (SIR), AC 5 — Parts 164–173",
    lastUpdated: "06-04-2026",
  },
  {
    id: "perumalpattu",
    name: "Perumalpattu",
    nameTa: "பெருமாள்பட்டு",
    subtitle: "Town Panchayat — Poonamallee (SC) AC",
    assemblyConstituency: "5 - Poonamallee (SC)",
    district: "Thiruvallur",
    pincode: "602024",
    status: "active",
    center: { lat: 13.092, lng: 79.918 },
    zoom: 14,
    rollsPublicPath: "/ward-election/perumalpattu/rolls",
    voterDataPath: "data/ward-election/perumalpattu/ward_members.json",
    electionDate: "TBD",
    source: "ECI Electoral Roll 2026 (SIR), AC 5 — Parts 188–197",
    lastUpdated: "06-04-2026",
  },
];

export const DEFAULT_AREA_ID = "veppampattu";

export function getElectionArea(id: string): ElectionArea | undefined {
  return ELECTION_AREAS.find((a) => a.id === id);
}

export function getActiveAreas(): ElectionArea[] {
  return ELECTION_AREAS.filter((a) => a.status === "active");
}

export function isValidAreaId(id: string): boolean {
  return ELECTION_AREAS.some((a) => a.id === id);
}

export function resolveAreaId(area?: string | null): string {
  if (area && isValidAreaId(area)) return area;
  return DEFAULT_AREA_ID;
}

/** Append ?area= to ward-election routes (preserves existing query). */
export function wardElectionHref(path: string, areaId: string): string {
  const [base, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("area", areaId);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
