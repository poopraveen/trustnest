import fs from "fs";
import path from "path";
import { DEFAULT_AREA_ID, getElectionArea } from "@/lib/ward-election-areas";

export interface VoterRecord {
  ward: number;
  page: number;
  serialNo: number | null;
  voterId: string;
  name: string;
  relativeType: string;
  relativeName: string;
  houseNumber: string;
  age: number | null;
  gender: string;
}

interface RawRecord {
  Ward: number;
  Page: number;
  Serial_No: number | string;
  Voter_ID: string;
  Name: string;
  Relative_Type: string;
  Relative_Name: string;
  House_Number: string;
  Age: number | string;
  Gender: string;
}

const _cache = new Map<string, VoterRecord[]>();

function dataPath(areaId: string): string {
  const area = getElectionArea(areaId) ?? getElectionArea(DEFAULT_AREA_ID)!;
  return path.join(process.cwd(), area.voterDataPath);
}

function normalize(r: RawRecord): VoterRecord {
  const age = r.Age === "" || r.Age == null ? null : Number(r.Age);
  const serial = r.Serial_No === "" || r.Serial_No == null ? null : Number(r.Serial_No);
  return {
    ward: r.Ward,
    page: r.Page,
    serialNo: Number.isNaN(serial as number) ? null : serial,
    voterId: r.Voter_ID,
    name: r.Name,
    relativeType: r.Relative_Type || "",
    relativeName: r.Relative_Name || "",
    houseNumber: String(r.House_Number || "").trim(),
    age: age != null && !Number.isNaN(age) ? age : null,
    gender: (r.Gender || "").trim(),
  };
}

export function loadAllVoters(areaId: string = DEFAULT_AREA_ID): VoterRecord[] {
  if (_cache.has(areaId)) return _cache.get(areaId)!;
  const file = dataPath(areaId);
  if (!fs.existsSync(file)) {
    _cache.set(areaId, []);
    return [];
  }
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as RawRecord[];
  const rows = raw.map(normalize);
  _cache.set(areaId, rows);
  return rows;
}

export function queryVoters(opts: {
  areaId?: string;
  ward?: number;
  house?: string;
  q?: string;
  page?: number;
  limit?: number;
}) {
  const { areaId = DEFAULT_AREA_ID, ward, house, q, page = 1, limit = 50 } = opts;
  let rows = loadAllVoters(areaId);
  if (ward != null) rows = rows.filter((v) => v.ward === ward);
  if (house) rows = rows.filter((v) => v.houseNumber === house);
  if (q?.trim()) {
    const term = q.trim().toLowerCase();
    rows = rows.filter(
      (v) =>
        v.name.toLowerCase().includes(term) ||
        v.voterId.toLowerCase().includes(term) ||
        v.houseNumber.toLowerCase().includes(term) ||
        v.relativeName.toLowerCase().includes(term)
    );
  }
  const total = rows.length;
  const start = (page - 1) * limit;
  const items = rows.slice(start, start + limit);
  return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
}

export function getVotersByHouse(
  ward: number,
  house: string,
  areaId: string = DEFAULT_AREA_ID
): VoterRecord[] {
  return loadAllVoters(areaId).filter((v) => v.ward === ward && v.houseNumber === house);
}
