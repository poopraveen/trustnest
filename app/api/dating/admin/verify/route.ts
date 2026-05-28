import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/dating-notifications";
import { sendVerificationStatusEmail } from "@/lib/dating-mailer";

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
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  const isApproved = action === "VERIFIED";
  const notifTitle = isApproved
    ? "✅ Your court case has been verified!"
    : "⚠️ Verification unsuccessful";
  const notifBody = isApproved
    ? "Welcome to TrustNest Hearts! Set up your profile to start discovering people."
    : (rejectionNote ?? "We could not verify your case. Please re-apply or contact support.");

  await createNotification(
    updated.user.id,
    isApproved ? "VERIFICATION_APPROVED" : "VERIFICATION_REJECTED",
    notifTitle,
    notifBody,
    isApproved ? "/dating/setup" : "/dating/pending"
  );

  // Email (fire-and-forget)
  sendVerificationStatusEmail(
    updated.user.email,
    updated.user.name ?? "Member",
    action,
    updated.fullCaseRef,
    rejectionNote
  );

  return NextResponse.json({ updated });
}
