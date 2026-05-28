import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Mock eCourts lookup — mirrors /api/dating/verify-case logic
function mockECourtsLookup(
  caseType: string,
  courtType: string,
  courtCity: string,
  state: string,
  caseNumber: string,
  year: number
): { verified: boolean; currentStatus: string; disposalDate: string | null } {
  const normalised = caseNumber.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z0-9/\-]+$/.test(normalised)) {
    return { verified: false, currentStatus: "Invalid case number format", disposalDate: null };
  }
  const disposalYear = year + 1 + Math.floor(Math.random() * 2);
  const isDisposed = disposalYear <= new Date().getFullYear();
  return {
    verified: true,
    currentStatus: isDisposed ? "Disposed – Decree of Divorce Granted" : "Under Hearing",
    disposalDate: isDisposed ? `15-03-${disposalYear}` : null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, caseType, courtType, courtCity, state, caseNumber, year } = body;

    if (!name || !email || !password || !caseType || !courtType || !courtCity || !state || !caseNumber || !year) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const caseYearNum = parseInt(year, 10);
    if (isNaN(caseYearNum) || caseYearNum < 1990 || caseYearNum > new Date().getFullYear()) {
      return NextResponse.json({ error: "Invalid case year." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const caseTypeCode: Record<string, string> = {
      MUTUAL_CONSENT: "HMA-13B",
      CONTESTED: "HMA-13",
      ANNULMENT: "ANL",
      JUDICIAL_SEPARATION: "JS",
    };

    const prefix = caseTypeCode[caseType] ?? "CS";
    const normalised = caseNumber.trim().toUpperCase();
    const fullCaseRef = `${prefix}/${normalised}/${caseYearNum}`;

    // Run mock eCourts verification synchronously
    const mockResult = mockECourtsLookup(caseType, courtType, courtCity, state, caseNumber, caseYearNum);
    const verificationStatus = mockResult.verified ? "VERIFIED" : "PENDING";

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashed,
        phone: phone ?? undefined,
        courtCaseVerification: {
          create: {
            caseType,
            courtType,
            courtCity,
            state,
            caseNumber: normalised,
            year: caseYearNum,
            fullCaseRef,
            status: verificationStatus,
            verifiedAt: verificationStatus === "VERIFIED" ? new Date() : null,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      verification: {
        status: verificationStatus,
        fullCaseRef,
        mockECourtsResponse: {
          status: mockResult.verified ? "SUCCESS" : "NOT_FOUND",
          caseRef: fullCaseRef,
          courtName: `${courtType}, ${courtCity}`,
          state,
          currentStatus: mockResult.currentStatus,
          disposalDate: mockResult.disposalDate,
          source: "ecourts.gov.in (mock)",
        },
      },
    });
  } catch (err) {
    console.error("[dating/register]", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
