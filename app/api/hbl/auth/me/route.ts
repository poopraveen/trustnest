import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("hbl_session")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const session = await prisma.hblSession.findUnique({
    where: { token },
    include: { member: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  const { member } = session;
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const checkedIn = await prisma.hblCheckIn.count({
    where: { memberId: member.id, checkedAt: { gte: todayStart } },
  });

  return NextResponse.json({ member: { ...member, checkedInToday: checkedIn > 0 } });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("hbl_session")?.value;
  if (token) await prisma.hblSession.deleteMany({ where: { token } });
  const res = NextResponse.json({ success: true });
  res.cookies.set("hbl_session", "", { maxAge: 0, path: "/" });
  return res;
}
