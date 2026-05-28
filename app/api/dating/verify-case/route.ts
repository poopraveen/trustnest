import { NextRequest, NextResponse } from "next/server";

// Mock eCourts India API response format
// In production, replace with real eCourts Services API: https://services.ecourts.gov.in/ecourtindiaAPI/

interface MockECourtsResponse {
  status: "SUCCESS" | "NOT_FOUND" | "INVALID_FORMAT";
  caseRef: string;
  petitioner: string;
  respondent: string;
  caseType: string;
  courtName: string;
  district: string;
  state: string;
  filingDate: string;
  hearingDate: string | null;
  disposalDate: string | null;
  currentStatus: string;
  nextDate: string | null;
  stage: string;
  verified: boolean;
  source: string;
}

function mockECourtsLookup(
  caseType: string,
  courtType: string,
  courtCity: string,
  state: string,
  caseNumber: string,
  year: number
): MockECourtsResponse {
  // Validate basic format — caseNumber should contain digits
  const normalised = caseNumber.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z0-9/\-]+$/.test(normalised)) {
    return {
      status: "INVALID_FORMAT",
      caseRef: "",
      petitioner: "",
      respondent: "",
      caseType: "",
      courtName: "",
      district: "",
      state: "",
      filingDate: "",
      hearingDate: null,
      disposalDate: null,
      currentStatus: "Invalid case number format",
      nextDate: null,
      stage: "",
      verified: false,
      source: "ecourts.gov.in (mock)",
    };
  }

  const caseTypeLabels: Record<string, string> = {
    MUTUAL_CONSENT: "HMA Sec. 13B – Mutual Consent Divorce",
    CONTESTED: "HMA Sec. 13 – Contested Divorce",
    ANNULMENT: "Annulment Petition",
    JUDICIAL_SEPARATION: "Judicial Separation",
  };

  const yearStr = String(year);
  const filingDate = `${Math.floor(Math.random() * 28) + 1 < 10 ? "0" + (Math.floor(Math.random() * 28) + 1) : Math.floor(Math.random() * 28) + 1}-${Math.floor(Math.random() * 12) + 1 < 10 ? "0" + (Math.floor(Math.random() * 12) + 1) : Math.floor(Math.random() * 12) + 1}-${yearStr}`;
  const disposalYear = year + 1 + Math.floor(Math.random() * 2);
  const isDisposed = disposalYear <= new Date().getFullYear();

  return {
    status: "SUCCESS",
    caseRef: `${caseTypeLabels[caseType]?.split(" ")[0] ?? "CS"}/${normalised}/${yearStr}`,
    petitioner: "[REDACTED – Privacy Protected]",
    respondent: "[REDACTED – Privacy Protected]",
    caseType: caseTypeLabels[caseType] ?? caseType,
    courtName: `${courtType}, ${courtCity}`,
    district: courtCity,
    state,
    filingDate,
    hearingDate: isDisposed ? null : `${Math.floor(Math.random() * 28) + 1}-${Math.floor(Math.random() * 12) + 1}-${new Date().getFullYear() + 1}`,
    disposalDate: isDisposed ? `15-03-${disposalYear}` : null,
    currentStatus: isDisposed ? "Disposed – Decree of Divorce Granted" : "Under Hearing",
    nextDate: isDisposed ? null : `${Math.floor(Math.random() * 28) + 1}-${Math.floor(Math.random() * 12) + 1}-${new Date().getFullYear() + 1}`,
    stage: isDisposed ? "Final Decree" : "Arguments / Hearing",
    verified: true,
    source: "ecourts.gov.in (mock)",
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { caseType, courtType, courtCity, state, caseNumber, year } = body;

  if (!caseType || !courtType || !courtCity || !state || !caseNumber || !year) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  // Simulate network delay of real API
  await new Promise((r) => setTimeout(r, 800));

  const result = mockECourtsLookup(caseType, courtType, courtCity, state, caseNumber, parseInt(year));

  return NextResponse.json(result);
}
