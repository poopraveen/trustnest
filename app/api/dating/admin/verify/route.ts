import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const pending = await prisma.courtCaseVerification.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ pending });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { verificationId, action, rejectionNote } = await req.json();
  if (!verificationId || !["VERIFIED", "REJECTED"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const updated = await prisma.courtCaseVerification.update({
    where: { id: verificationId },
    data: {
      status: action,
      verifiedAt: action === "VERIFIED" ? new Date() : null,
      rejectionNote: action === "REJECTED" ? (rejectionNote ?? "Case number could not be verified.") : null,
    },
  });

  return NextResponse.json({ updated });
}
