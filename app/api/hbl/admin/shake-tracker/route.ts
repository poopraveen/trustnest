import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-hbl-admin") === (process.env.HBL_ADMIN_PIN ?? "9999");
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);

  const activeMembers = await prisma.hblMember.findMany({
    where: { status: "ACTIVE" },
    include: {
      shakeLogs: { where: { loggedAt: { gte: weekStart } }, orderBy: { loggedAt: "desc" } },
      checkIns: { where: { checkedAt: { gte: weekStart } }, orderBy: { checkedAt: "desc" } },
    },
    orderBy: { joinedAt: "desc" },
  });

  const todayShakes = await prisma.hblShakeLog.count({ where: { loggedAt: { gte: todayStart } } });

  const tracker = activeMembers.map((m) => {
    const lastShake = m.shakeLogs[0]?.loggedAt ?? null;
    const lastCheckIn = m.checkIns[0]?.checkedAt ?? null;
    const weekShakes = m.shakeLogs.length;
    const weekCheckIns = m.checkIns.length;
    const daysSinceShake = lastShake ? Math.floor((Date.now() - new Date(lastShake).getTime()) / 86400000) : 999;
    const daysSinceCheckIn = lastCheckIn ? Math.floor((Date.now() - new Date(lastCheckIn).getTime()) / 86400000) : 999;
    const daysSinceJoin = Math.floor((Date.now() - new Date(m.joinedAt).getTime()) / 86400000);

    return {
      id: m.id, name: m.name, phone: m.phone, plan: m.plan,
      joinedAt: m.joinedAt, daysSinceJoin,
      lastShake, daysSinceShake, weekShakes,
      lastCheckIn, daysSinceCheckIn, weekCheckIns,
      isActive: daysSinceCheckIn <= 3,
      needsAttention: daysSinceCheckIn > 3 || daysSinceShake > 3,
    };
  });

  return NextResponse.json({ tracker, todayShakes, totalActive: activeMembers.length });
}
