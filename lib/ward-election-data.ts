// Ward Election data layer.
// Populated from official Electoral Roll PDFs (Special Intensive Revision 2026,
// Tamil Nadu). Each "Ward" models one polling part of the roll. The source PDF
// for each part is copied into /public/ward-election/rolls and linked via
// `rollPdf` so figures are verifiable. The UI and AI strategy read from here.

export interface Ward {
  id: string;
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
    id: "AC5-P173", number: 173, partNo: 173, name: "Veppampattu — Part 173",
    nameTa: "அண்ணா நகர் வார்டு 2",
    sections: ["Anna Nagar Ward 2"],
    pollingStation: "173 - Govt High School (West Facing), Veppampattu - 602024",
    male: 436, female: 469, thirdGender: 0, electorate: 905, startSerial: 1, endSerial: 907,
    rollPdf: "/ward-election/rolls/part-173.pdf", ...COMMON,
  },
];

export const ELECTION_META: ElectionMeta = {
  title: "Ward Election",
  body: "Veppampattu Town Panchayat — Poonamallee (SC) AC",
  electionDate: "TBD",
  totalWards: WARDS.length,
  totalElectors: WARDS.reduce((sum, w) => sum + (w.electorate ?? 0), 0),
  source: "ECI Electoral Roll 2026 (SIR), AC 5 Poonamallee — Parts 164–173",
  lastUpdated: "06-04-2026",
};

export const CANDIDATES: Candidate[] = [];

// Convenience lookups for feature code.
export function getWardById(id: string): Ward | undefined {
  return WARDS.find((w) => w.id === id);
}

export function getWardByPart(partNo: number): Ward | undefined {
  return WARDS.find((w) => w.partNo === partNo);
}
