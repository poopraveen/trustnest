import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminContext, tenantWhere } from "@/lib/hbl-tenant";

export async function POST(req: NextRequest) {
  const ctx = await getAdminContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json(); // memberCode or qrCode
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  const where = tenantWhere(ctx);

  // Try memberCode first, then qrCode
  const member = await prisma.hblMember.findFirst({
    where: {
      ...where,
      OR: [{ memberCode: code }, { qrCode: code }],
    },
  });

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  // Check if already checked in today
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const alreadyIn = await prisma.hblCheckIn.findFirst({
    where: { memberId: member.id, checkedAt: { gte: todayStart } },
  });

  if (alreadyIn) {
    return NextResponse.json({ alreadyCheckedIn: true, member: memberSummary(member) });
  }

  // Record check-in and award point
  await prisma.$transaction([
    prisma.hblCheckIn.create({ data: { memberId: member.id } }),
    prisma.hblMember.update({ where: { id: member.id }, data: { points: { increment: 1 } } }),
    prisma.hblLoyaltyTxn.create({ data: { memberId: member.id, points: 1, reason: "Daily check-in (barcode)" } }),
  ]);

  return NextResponse.json({ success: true, pointsEarned: 1, member: memberSummary(member) });
}

function memberSummary(m: { id: string; name: string; phone: string; plan: string; status: string; points: number; memberCode: string | null }) {
  return { id: m.id, name: m.name, phone: m.phone, plan: m.plan, status: m.status, points: m.points, memberCode: m.memberCode };
}
