import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminContext, tenantWhere } from "@/lib/hbl-tenant";

export async function GET(req: NextRequest) {
  const ctx = await getAdminContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tw = tenantWhere(ctx);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const renewalWindow = new Date(now.getTime() + 7 * 86400000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

  const [activeMembers, expiringMembers, newJoiners] = await Promise.all([
    prisma.hblMember.findMany({
      where: { ...tw, status: "ACTIVE" },
      include: {
        checkIns: { where: { checkedAt: { gte: sevenDaysAgo } }, orderBy: { checkedAt: "desc" } },
        orders: { where: { createdAt: { gte: new Date(now.getTime() - 14 * 86400000) } }, orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.hblMember.findMany({ where: { ...tw, status: "ACTIVE", expiresAt: { lte: renewalWindow } }, orderBy: { expiresAt: "asc" } }),
    prisma.hblMember.findMany({ where: { ...tw, joinedAt: { gte: thirtyDaysAgo } }, include: { checkIns: { orderBy: { checkedAt: "desc" }, take: 1 } } }),
  ]);

  type FollowUpItem = {
    id: string; memberId: string; memberName: string; phone: string;
    reason: string; reasonLabel: string; priority: string;
    detail: string; daysOverdue?: number;
  };
  const followUpList: FollowUpItem[] = [];

  for (const m of activeMembers) {
    const lastCI = m.checkIns[0]?.checkedAt;
    const days = lastCI ? Math.floor((now.getTime() - new Date(lastCI).getTime()) / 86400000) : 999;
    if (days >= 3) {
      followUpList.push({
        id: `no-checkin-${m.id}`, memberId: m.id, memberName: m.name, phone: m.phone,
        reason: "NO_CHECKIN", reasonLabel: "No Check-In",
        priority: days >= 7 ? "HIGH" : "MEDIUM",
        detail: days === 999 ? "Never checked in" : `Last check-in ${days} days ago`, daysOverdue: days,
      });
    }
  }

  for (const m of activeMembers) {
    if (m.orders.length === 0) {
      const daysSinceJoin = Math.floor((now.getTime() - new Date(m.joinedAt ?? now).getTime()) / 86400000);
      if (daysSinceJoin >= 14) {
        followUpList.push({
          id: `no-order-${m.id}`, memberId: m.id, memberName: m.name, phone: m.phone,
          reason: "NO_ORDER", reasonLabel: "No Recent Order",
          priority: "LOW", detail: "No order in the last 14 days",
        });
      }
    }
  }

  for (const m of expiringMembers) {
    const days = Math.ceil((new Date(m.expiresAt).getTime() - now.getTime()) / 86400000);
    followUpList.push({
      id: `expiring-${m.id}`, memberId: m.id, memberName: m.name, phone: m.phone,
      reason: "EXPIRING", reasonLabel: "Membership Expiring",
      priority: days <= 2 ? "HIGH" : "MEDIUM",
      detail: `Expires in ${days} day${days !== 1 ? "s" : ""}`, daysOverdue: days,
    });
  }

  for (const m of newJoiners) {
    const daysSinceJoin = Math.floor((now.getTime() - new Date(m.joinedAt).getTime()) / 86400000);
    const lastCI = m.checkIns[0]?.checkedAt;
    const daysSinceCI = lastCI ? Math.floor((now.getTime() - new Date(lastCI).getTime()) / 86400000) : 999;
    if ([3, 7, 14, 30].some(d => Math.abs(daysSinceJoin - d) <= 1)) {
      followUpList.push({
        id: `newjoiner-${m.id}-d${daysSinceJoin}`, memberId: m.id, memberName: m.name, phone: m.phone,
        reason: "NEW_JOINER", reasonLabel: "New Joiner Check-In",
        priority: "MEDIUM",
        detail: `Day ${daysSinceJoin} milestone — ${daysSinceCI <= 1 ? "Active ✓" : "Needs encouragement"}`,
      });
    }
  }

  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  followUpList.sort((a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3) - (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3));

  return NextResponse.json({ followUps: followUpList, total: followUpList.length });
}

export async function PATCH(req: NextRequest) {
  const ctx = await getAdminContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { memberId, reason, note } = await req.json();
  await prisma.hblFollowUp.create({
    data: { memberId, reason, note, dueDate: new Date(), done: true, doneAt: new Date() },
  });
  return NextResponse.json({ success: true });
}
