// Ward Election data layer.
// Populated from official Electoral Roll PDFs (Special Intensive Revision 2026,
// Tamil Nadu). Each "Ward" models one polling part of the roll. The source PDF
// for each part is copied into /public/ward-election/{area}/rolls and linked via
// `rollPdf` so figures are verifiable. The UI and AI strategy read from here.
// Use getWardsForArea(areaId) for multi-area campaigns (Veppampattu, Perumalpattu).

import {
  DEFAULT_AREA_ID,
  getElectionArea,
  type ElectionArea,
} from "@/lib/ward-election-areas";

export interface Ward {
  id: string;
  areaId: string;
  name: string;
  nameTa?: string;
  number: number;
  zone?: string;
  electorate?: number;

  // ─── Electoral roll part details ──────────────────────────────────────────
  partNo?: number;
  sections?: string[];                 // street wards / areas covered by the part
  assemblyConstituency?: string;       // e.g. "5 - Poonamallee (SC)"
  parliamentaryConstituency?: string;  // e.g. "1 - Thiruvallur (SC)"
  pollingStation?: string;
  village?: string;
  postOffice?: string;
  policeStation?: string;
  block?: string;
  district?: string;
  pincode?: string;
  rollPdf?: string;                    // public path to the source roll PDF

  // ─── Elector demographics (from the part's "Number of Electors" summary) ───
  male?: number;
  female?: number;
  thirdGender?: number;
  startSerial?: number;
  endSerial?: number;
}

export interface Candidate {
  id: string;
  name: string;
  nameTa?: string;
  party: string;
  symbol?: string;
  wardId: string;
  votes?: number;
}

export interface ElectionMeta {
  title: string;
  body: string;
  electionDate: string;
  totalWards: number;
  totalElectors: number;
  source: string;
  lastUpdated: string;
}

// Common attributes shared by every part in this constituency snapshot.
const COMMON = {
  areaId: "veppampattu",
  assemblyConstituency: "5 - Poonamallee (SC)",
  parliamentaryConstituency: "1 - Thiruvallur (SC)",
  village: "Veppampattu",
  postOffice: "Ayalur",
  policeStation: "Sevvapettai",
  block: "Thiruvallur",
  district: "Thiruvallur",
  pincode: "602025",
  zone: "Veppampattu",
} as const;

// ─── DATA ───────────────────────────────────────────────────────────────────
// Source: Electoral Roll 2026 (S22 Tamil Nadu), Special Intensive Revision 2026,
// published 06-04-2026 (qualifying date 01-04-2026). AC 5 - Poonamallee (SC).

export const WARDS: Ward[] = [
  {
    id: "AC5-P164", number: 164, partNo: 164, name: "Veppampattu — Part 164",
    sections: ["Kudiyanavar Street Ward 1", "Poongavanathamman Street Ward 1", "Kambar Street Ward 1", "Arunkrishna Nagar Ward 1"],
    pollingStation: "164 - Panchayat Union Elementary School (North Facing), Veppampattu - 602024",
    male: 434, female: 432, thirdGender: 1, electorate: 867, startSerial: 1, endSerial: 869,
    rollPdf: "/ward-election/rolls/part-164.pdf", ...COMMON,
  },
  {
    id: "AC5-P165", number: 165, partNo: 165, name: "Veppampattu — Part 165",
    sections: ["Ganesh Nagar Ward 1", "Ayyanthiruvalluvar Nagar Ward 1", "Overseas Electors"],
    pollingStation: "165 - Panchayat Union Elementary School (East Facing), Veppampattu - 602024",
    male: 331, female: 339, thirdGender: 0, electorate: 670, startSerial: 1, endSerial: 671,
    rollPdf: "/ward-election/rolls/part-165.pdf", ...COMMON,
  },
  {
    id: "AC5-P166", number: 166, partNo: 166, name: "Veppampattu — Part 166",
    sections: ["Chathiram Ward 1", "Balaji Nagar Ward 2", "21st Century Nagar"],
    pollingStation: "166 - Panchayat Union Elementary School (East Facing, Room 1), Veppampattu - 602024",
    male: 532, female: 544, thirdGender: 0, electorate: 1076, startSerial: 1, endSerial: 1081,
    rollPdf: "/ward-election/rolls/part-166.pdf", ...COMMON,
  },
  {
    id: "AC5-P167", number: 167, partNo: 167, name: "Veppampattu — Part 167",
    sections: ["Markar Ward 2", "Sri Ragaventhira Nagar Ward 2", "Barathi Nagar Ward 2", "Sri Balaji Nagar Ward 2", "Overseas Electors"],
    pollingStation: "167 - Panchayat Union Elementary School (East Facing), Veppampattu - 602024",
    male: 563, female: 563, thirdGender: 0, electorate: 1126, startSerial: 1, endSerial: 1128,
    rollPdf: "/ward-election/rolls/part-167.pdf", ...COMMON,
  },
  {
    id: "AC5-P168", number: 168, partNo: 168, name: "Veppampattu — Part 168",
    sections: ["S T Perumal Nagar Ward 2", "Srinivasa Nagar", "Sengalamman Nagar", "Varalakshmi Nagar", "Raja Rajeswari Nagar", "Esvaran Nagar", "Overseas Electors"],
    pollingStation: "168 - Panchayat Union Elementary School (East Facing), Veppampattu - 602024",
    male: 532, female: 560, thirdGender: 0, electorate: 1092, startSerial: 1, endSerial: 1096,
    rollPdf: "/ward-election/rolls/part-168.pdf", ...COMMON,
  },
  {
    id: "AC5-P169", number: 169, partNo: 169, name: "Veppampattu — Part 169",
    sections: ["Neru Nagar Ward 2", "Santhi Nagar Ward 2", "Esvaran Nagar Ward 1"],
    pollingStation: "169 - Panchayat Union Elementary School (South Facing), Veppampattu - 602024",
    male: 397, female: 420, thirdGender: 1, electorate: 818, startSerial: 1, endSerial: 821,
    rollPdf: "/ward-election/rolls/part-169.pdf", ...COMMON,
  },
  {
    id: "AC5-P170", number: 170, partNo: 170, name: "Veppampattu — Part 170",
    sections: ["Arul Selvam Nagar Ward 2", "Arul Selvam Colony Ward 2"],
    pollingStation: "170 - Panchayat Union Elementary School (East Facing), Veppampattu - 602024",
    male: 290, female: 306, thirdGender: 0, electorate: 596, startSerial: 1, endSerial: 596,
    rollPdf: "/ward-election/rolls/part-170.pdf", ...COMMON,
  },
  {
    id: "AC5-P171", number: 171, partNo: 171, name: "Veppampattu — Part 171",
    sections: ["Ramkrishna Nagar Ward 2", "Dr. Ambethkar Nagar Ward 2", "Anna Nagar Earikkarai Ward 2", "M R K Nagar Ward 2"],
    pollingStation: "171 - Govt High School (West Facing), Veppampattu - 602024",
    male: 483, female: 535, thirdGender: 0, electorate: 1018, startSerial: 1, endSerial: 1028,
    rollPdf: "/ward-election/rolls/part-171.pdf", ...COMMON,
  },
  {
    id: "AC5-P172", number: 172, partNo: 172, name: "Veppampattu — Part 172",
    sections: ["See voter extract — official roll PDF pending"],
    pollingStation: "172 — polling station (roll PDF pending)",
    rollPdf: undefined,
    ...COMMON,
  },
  {
    id: "AC5-P173", number: 173, partNo: 173, name: "Veppampattu — Part 173",
    nameTa: "அண்ணா நகர் வார்டு 2",
    sections: ["Anna Nagar Ward 2"],
    pollingStation: "173 - Govt High School (West Facing), Veppampattu - 602024",
    male: 436, female: 469, thirdGender: 0, electorate: 905, startSerial: 1, endSerial: 907,
    rollPdf: "/ward-election/rolls/part-173.pdf", ...COMMON,
  },
];

// Perumalpattu — AC 5 Poonamallee (SC), Parts 188–197 (rolls in public/ward-election/perumalpattu/rolls/)
const PERUMALPATTU_COMMON = {
  areaId: "perumalpattu",
  assemblyConstituency: "5 - Poonamallee (SC)",
  parliamentaryConstituency: "1 - Thiruvallur (SC)",
  village: "Perumalpattu",
  postOffice: "Tirunindravur",
  policeStation: "Sevvapettai",
  block: "Thiruvallur",
  district: "Thiruvallur",
  pincode: "602024",
  zone: "Perumalpattu",
} as const;

const PERUMALPATTU_ROLL = "/ward-election/perumalpattu/rolls";

export const PERUMALPATTU_WARDS: Ward[] = [
  {
    id: "AC5-P188", number: 188, partNo: 188, name: "Perumalpattu — Part 188",
    sections: [
      "Permalpattu (P), M.L.A Street Ward 2",
      "Permalpattu (P), Yadhavar Street Ward 2",
      "Permalpattu (P), Amman Kovil Street Ward 1",
      "Permalpattu (P), Bajanai Kovil Street Sarthan Street Thachar Street",
    ],
    pollingStation: "188 - Panchayat Union Middle School (North Facing), Perumalpattu - 602024",
    male: 466, female: 516, thirdGender: 0, electorate: 982, startSerial: 1, endSerial: 988,
    rollPdf: `${PERUMALPATTU_ROLL}/part-188.pdf`, ...PERUMALPATTU_COMMON,
  },
  {
    id: "AC5-P191", number: 191, partNo: 191, name: "Perumalpattu — Part 191",
    sections: ["Permalpattu (P), TNHB Ward 4"],
    pollingStation: "191 - Panchayat Union Middle School (South Facing), Perumalpattu - 602024",
    male: 500, female: 529, thirdGender: 0, electorate: 1029, startSerial: 1, endSerial: 1038,
    rollPdf: `${PERUMALPATTU_ROLL}/part-191.pdf`, ...PERUMALPATTU_COMMON,
  },
  {
    id: "AC5-P192", number: 192, partNo: 192, name: "Perumalpattu — Part 192",
    sections: [
      "Permalpattu (P), Mullai Nagar Ward 3",
      "Permalpattu (P), Ramana Nagar Ward 4",
    ],
    pollingStation: "192 - Panchayat Union Middle School (East Facing, 8th Std Room), Perumalpattu - 602024",
    male: 356, female: 378, thirdGender: 0, electorate: 734, startSerial: 1, endSerial: 738,
    rollPdf: `${PERUMALPATTU_ROLL}/part-192.pdf`, ...PERUMALPATTU_COMMON,
  },
  {
    id: "AC5-P193", number: 193, partNo: 193, name: "Perumalpattu — Part 193",
    sections: [
      "Permalpattu (P), Om Sakthi Nagar Ward 4",
      "Permalpattu (P), P.V Nagar Ward 2",
      "Permalpattu (P), Rappalliyar Street Sanar Street Ward 1",
      "Permalpattu (P), G.K Nagar Ward 2",
    ],
    pollingStation: "193 - Panchayat Union Middle School (East Facing), Perumalpattu - 602024",
    male: 476, female: 506, thirdGender: 0, electorate: 982, startSerial: 1, endSerial: 984,
    rollPdf: `${PERUMALPATTU_ROLL}/part-193.pdf`, ...PERUMALPATTU_COMMON,
  },
  {
    id: "AC5-P194", number: 194, partNo: 194, name: "Perumalpattu — Part 194",
    sections: [
      "Permalpattu (P), Kovilkuppam Ward 1",
      "Permalpattu (P), Seranar Street Ward 1",
      "Overseas Electors",
    ],
    pollingStation: "194 - Panchayat Union Middle School (East Facing), Perumalpattu - 602024",
    male: 328, female: 336, thirdGender: 0, electorate: 664, startSerial: 1, endSerial: 666,
    rollPdf: `${PERUMALPATTU_ROLL}/part-194.pdf`, ...PERUMALPATTU_COMMON,
  },
  {
    id: "AC5-P195", number: 195, partNo: 195, name: "Perumalpattu — Part 195",
    sections: [
      "Permalpattu (P), Perumalpattu",
      "Permalpattu (P), Ragaventhira Nagar",
    ],
    pollingStation: "195 - Panchayat Union Middle School (North Facing, Room 2), Perumalpattu - 602024",
    ...PERUMALPATTU_COMMON,
    postOffice: "Thiruverkadu",
    policeStation: "Thirunindravur",
    block: "Poonamallee",
    pincode: "600077",
    male: 563, female: 533, thirdGender: 0, electorate: 1096, startSerial: 1, endSerial: 1105,
    rollPdf: `${PERUMALPATTU_ROLL}/part-195.pdf`,
  },
  {
    id: "AC5-P196", number: 196, partNo: 196, name: "Perumalpattu — Part 196",
    sections: [
      "Permalpattu (P), Rail Nagar",
      "Permalpattu (P), I.O.P Nagar",
      "Permalpattu (P), A.K.N nagar Rail Nagar Arugill",
      "Permalpattu (P), Maruthi Nagar Anex 1",
    ],
    pollingStation: "196 - Panchayat Union Middle School Anganwadi (East Facing), Perumalpattu - 602024",
    male: 456, female: 470, thirdGender: 0, electorate: 926, startSerial: 1, endSerial: 930,
    rollPdf: `${PERUMALPATTU_ROLL}/part-196.pdf`, ...PERUMALPATTU_COMMON,
  },
  {
    id: "AC5-P197", number: 197, partNo: 197, name: "Perumalpattu — Part 197",
    sections: [
      "Perumalpattu (V), K G R New Town",
      "Perumalpattu (V), Vadivudaiyamman Nagar",
      "Perumalpattu (V), Bathamavathi Nagar",
      "Overseas Electors",
    ],
    pollingStation: "197 - Panchayat Union Middle School, Perumalpattu - 602024",
    male: 434, female: 433, thirdGender: 0, electorate: 867, startSerial: 1, endSerial: 870,
    rollPdf: `${PERUMALPATTU_ROLL}/part-197.pdf`, ...PERUMALPATTU_COMMON,
  },
];

export const ALL_WARDS: Ward[] = [...WARDS, ...PERUMALPATTU_WARDS];

export function getWardsForArea(areaId: string): Ward[] {
  return ALL_WARDS.filter((w) => w.areaId === areaId);
}

export function getElectionMetaForArea(areaId: string): ElectionMeta {
  const area = getElectionArea(areaId);
  const wards = getWardsForArea(areaId);
  const totalElectors = wards.reduce((sum, w) => sum + (w.electorate ?? 0), 0);
  return {
    title: "Ward Election",
    body: area
      ? `${area.name} — ${area.subtitle}`
      : "Ward Election",
    electionDate: area?.electionDate ?? "TBD",
    totalWards: wards.length,
    totalElectors,
    source: area?.source ?? "",
    lastUpdated: area?.lastUpdated ?? "",
  };
}

/** Default exports — Veppampattu (backward compatible). */
export const ELECTION_META: ElectionMeta = getElectionMetaForArea(DEFAULT_AREA_ID);

export const CANDIDATES: Candidate[] = [];

export function getWardById(id: string, areaId?: string): Ward | undefined {
  const pool = areaId ? getWardsForArea(areaId) : ALL_WARDS;
  return pool.find((w) => w.id === id);
}

export function getWardByPart(partNo: number, areaId?: string): Ward | undefined {
  const pool = areaId ? getWardsForArea(areaId) : ALL_WARDS;
  return pool.find((w) => w.partNo === partNo);
}

export function areaFromWard(ward: Ward): ElectionArea | undefined {
  return getElectionArea(ward.areaId);
}
