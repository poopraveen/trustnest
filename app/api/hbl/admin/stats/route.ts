import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-hbl-admin") === (process.env.HBL_ADMIN_PIN ?? "9999");
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0,0,0,0);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const renewalWindow = new Date(); renewalWindow.setDate(renewalWindow.getDate() + 7);

  const [
    totalActive, totalExpired, todayCheckIns, todayOrders, todayRevenue,
    weekRevenue, monthRevenue, pendingOrders, lowStockProducts, renewalsDue,
  ] = await Promise.all([
    prisma.hblMember.count({ where: { status: "ACTIVE" } }),
    prisma.hblMember.count({ where: { status: "EXPIRED" } }),
    prisma.hblCheckIn.count({ where: { checkedAt: { gte: todayStart } } }),
    prisma.hblOrder.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.hblPayment.aggregate({ where: { createdAt: { gte: todayStart } }, _sum: { amount: true } }),
    prisma.hblPayment.aggregate({ where: { createdAt: { gte: weekStart } }, _sum: { amount: true } }),
    prisma.hblPayment.aggregate({ where: { createdAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.hblOrder.count({ where: { status: { in: ["PENDING", "PREPARING"] } } }),
    prisma.hblProduct.findMany({ where: { isActive: true }, select: { id: true, name: true, stock: true, minStock: true } }),
    prisma.hblMember.findMany({
      where: { status: "ACTIVE", expiresAt: { lte: renewalWindow } },
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
