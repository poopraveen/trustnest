import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminContext, tenantWhere } from "@/lib/hbl-tenant";

export async function GET(req: NextRequest) {
  const ctx = await getAdminContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tw = tenantWhere(ctx);

  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newJoiners = await prisma.hblMember.findMany({
    where: { ...tw, joinedAt: { gte: thirtyDaysAgo } },
    include: {
      checkIns: { orderBy: { checkedAt: "desc" } },
      shakeLogs: { orderBy: { loggedAt: "desc" } },
      orders: { orderBy: { createdAt: "desc" }, take: 3 },
    },
    orderBy: { joinedAt: "desc" },
  });

  const enriched = newJoiners.map((m) => {
    const daysSinceJoin = Math.floor((Date.now() - new Date(m.joinedAt).getTime()) / 86400000);
    const totalCheckIns = m.checkIns.length;
    const totalShakes = m.shakeLogs.length;
    const totalOrders = m.orders.length;
    const firstCheckIn = m.checkIns.at(-1)?.checkedAt ?? null;
    const firstShake = m.shakeLogs.at(-1)?.loggedAt ?? null;
    const lastActivity = m.checkIns[0]?.checkedAt ?? null;
    const daysSinceActivity = lastActivity
      ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / 86400000)
      : daysSinceJoin;

    const milestones = [];
    if (firstCheckIn) milestones.push("first_checkin");
    if (firstShake) milestones.push("first_shake");
    if (totalOrders > 0) milestones.push("first_order");
    if (totalCheckIns >= 7) milestones.push("7_day_streak");
    if (daysSinceJoin >= 14 && totalCheckIns >= 10) milestones.push("2_week_active");
    if (daysSinceJoin >= 30 && totalCheckIns >= 20) milestones.push("30_day_champion");

    const engagement =
      totalCheckIns >= 20 ? "HIGH" :
      totalCheckIns >= 10 ? "MEDIUM" :
      totalCheckIns >= 3 ? "LOW" : "INACTIVE";

    return {
      id: m.id, name: m.name, phone: m.phone, plan: m.plan, memberCode: m.memberCode,
      joinedAt: m.joinedAt, daysSinceJoin,
      totalCheckIns, totalShakes, totalOrders,
      firstCheckIn, firstShake, lastActivity, daysSinceActivity,
      milestones, engagement,
    };
  });

  return NextResponse.json({ newJoiners: enriched });
}
