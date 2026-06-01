import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-hbl-admin") === (process.env.HBL_ADMIN_PIN ?? "9999");
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "month";

  const now = new Date();
  let startDate: Date;
  if (range === "week") { startDate = new Date(now); startDate.setDate(now.getDate() - 7); }
  else if (range === "month") { startDate = new Date(now.getFullYear(), now.getMonth(), 1); }
  else { startDate = new Date(now.getFullYear(), 0, 1); } // year

  const [orders, popularProducts, retentionData, newMembers] = await Promise.all([
    prisma.hblOrder.findMany({
      where: { createdAt: { gte: startDate } },
      include: { items: { include: { product: { select: { name: true, category: true } } } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.hblOrderItem.groupBy({
      by: ["productId"],
      where: { order: { createdAt: { gte: startDate } } },
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 5,
    }),
    prisma.hblMember.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.hblMember.count({ where: { joinedAt: { gte: startDate } } }),
  ]);

  const productIds = popularProducts.map((p) => p.productId);
  const productDetails = await prisma.hblProduct.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, category: true } });

  const popular = popularProducts.map((p) => ({
    ...p,
    product: productDetails.find((d) => d.id === p.productId),
  }));

  const dailySales: Record<string, number> = {};
  for (const o of orders) {
    const day = o.createdAt.toISOString().slice(0, 10);
    dailySales[day] = (dailySales[day] ?? 0) + o.totalAmount;
  }

  return NextResponse.json({ dailySales, popularProducts: popular, retentionData, newMembers, totalOrders: orders.length, totalRevenue: orders.reduce((s, o) => s + o.totalAmount, 0) });
}
