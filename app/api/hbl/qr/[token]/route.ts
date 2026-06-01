import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/hbl/qr/[token]
// Validates the QR code, creates a 30-day session, sets cookie, redirects to dashboard.
export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const member = await prisma.hblMember.findUnique({ where: { qrCode: params.token } });

  if (!member) {
    const url = new URL("/en/hbl", req.url);
    url.searchParams.set("error", "invalid_qr");
    return NextResponse.redirect(url);
  }

  if (member.status !== "ACTIVE") {
    const url = new URL("/en/hbl", req.url);
    url.searchParams.set("error", "inactive");
    return NextResponse.redirect(url);
  }

  // Create session
  const session = await prisma.hblSession.create({
    data: {
      memberId: member.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Auto check-in if not already done today
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const existing = await prisma.hblCheckIn.findFirst({
    where: { memberId: member.id, checkedAt: { gte: todayStart } },
  });
  if (!existing) {
    await prisma.$transaction([
      prisma.hblCheckIn.create({ data: { memberId: member.id } }),
      prisma.hblMember.update({ where: { id: member.id }, data: { points: { increment: 1 } } }),
      prisma.hblLoyaltyTxn.create({ data: { memberId: member.id, points: 1, reason: "QR Check-in" } }),
    ]);
  }

  const dashboardUrl = new URL("/en/hbl/dashboard", req.url);
  dashboardUrl.searchParams.set("qr_checkin", existing ? "already" : "done");

  const res = NextResponse.redirect(dashboardUrl);
  res.cookies.set("hbl_session", session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
  return res;
}
