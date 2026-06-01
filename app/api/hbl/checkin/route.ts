import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getMember(req: NextRequest) {
  const token = req.cookies.get("hbl_session")?.value;
  if (!token) return null;
  const session = await prisma.hblSession.findUnique({ where: { token }, include: { member: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.member;
}

export async function POST(req: NextRequest) {
  const member = await getMember(req);
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (member.status !== "ACTIVE") return NextResponse.json({ error: "Membership inactive" }, { status: 403 });

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const existing = await prisma.hblCheckIn.findFirst({
    where: { memberId: member.id, checkedAt: { gte: todayStart } },
  });
  if (existing) return NextResponse.json({ error: "Already checked in today", checkedIn: true }, { status: 409 });

  const checkIn = await prisma.hblCheckIn.create({ data: { memberId: member.id } });

  // Award 1 loyalty point per check-in
  await prisma.$transaction([
    prisma.hblMember.update({ where: { id: member.id }, data: { points: { increment: 1 } } }),
    prisma.hblLoyaltyTxn.create({ data: { memberId: member.id, points: 1, reason: "Daily check-in" } }),
  ]);

  return NextResponse.json({ success: true, checkIn, pointsEarned: 1 });
}

export async function GET(req: NextRequest) {
  const member = await getMember(req);
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const checkIns = await prisma.hblCheckIn.findMany({
    where: { memberId: member.id },
    orderBy: { checkedAt: "desc" },
    take: 30,
  });
  return NextResponse.json({ checkIns });
}
