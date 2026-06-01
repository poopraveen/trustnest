import fs from "fs";
import path from "path";

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

let _cache: VoterRecord[] | null = null;

function dataPath(): string {
  return path.join(process.cwd(), "data/ward-election/ward_members.json");
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

export function loadAllVoters(): VoterRecord[] {
  if (_cache) return _cache;
  const raw = JSON.parse(fs.readFileSync(dataPath(), "utf8")) as RawRecord[];
  _cache = raw.map(normalize);
  return _cache;
}

export function queryVoters(opts: {
  ward?: number;
  house?: string;
  q?: string;
  page?: number;
  limit?: number;
}) {
  const { ward, house, q, page = 1, limit = 50 } = opts;
  let rows = loadAllVoters();
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

export function getVotersByHouse(ward: number, house: string): VoterRecord[] {
  return loadAllVoters().filter((v) => v.ward === ward && v.houseNumber === house);
}
