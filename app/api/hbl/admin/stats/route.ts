import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminContext, tenantWhere } from "@/lib/hbl-tenant";

export async function GET(req: NextRequest) {
  const ctx = await getAdminContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tw = tenantWhere(ctx);
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0,0,0,0);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const renewalWindow = new Date(); renewalWindow.setDate(renewalWindow.getDate() + 7);

  const [
    totalActive, totalExpired, todayCheckIns, todayOrders, todayRevenue,
    weekRevenue, monthRevenue, pendingOrders, lowStockProducts, renewalsDue,
  ] = await Promise.all([
    prisma.hblMember.count({ where: { ...tw, status: "ACTIVE" } }),
    prisma.hblMember.count({ where: { ...tw, status: "EXPIRED" } }),
    prisma.hblCheckIn.count({ where: { member: tw, checkedAt: { gte: todayStart } } }),
    prisma.hblOrder.count({ where: { ...tw, createdAt: { gte: todayStart } } }),
    prisma.hblPayment.aggregate({ where: { member: tw, createdAt: { gte: todayStart } }, _sum: { amount: true } }),
    prisma.hblPayment.aggregate({ where: { member: tw, createdAt: { gte: weekStart } }, _sum: { amount: true } }),
    prisma.hblPayment.aggregate({ where: { member: tw, createdAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.hblOrder.count({ where: { ...tw, status: { in: ["PENDING", "PREPARING"] } } }),
    prisma.hblProduct.findMany({ where: { ...tw, isActive: true }, select: { id: true, name: true, stock: true, minStock: true } }),
    prisma.hblMember.findMany({
      where: { ...tw, status: "ACTIVE", expiresAt: { lte: renewalWindow } },
      select: { id: true, name: true, phone: true, plan: true, expiresAt: true },
      orderBy: { expiresAt: "asc" },
      take: 10,
    }),
  ]);

  const lowStock = lowStockProducts.filter((p) => p.stock <= p.minStock);

  return NextResponse.json({
    totalActive, totalExpired, todayCheckIns, todayOrders,
    todayRevenue: todayRevenue._sum.amount ?? 0,
    weekRevenue: weekRevenue._sum.amount ?? 0,
    monthRevenue: monthRevenue._sum.amount ?? 0,
    pendingOrders, lowStock, renewalsDue,
  });
}
