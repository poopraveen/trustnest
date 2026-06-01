import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminContext, tenantWhere } from "@/lib/hbl-tenant";

export async function GET(req: NextRequest) {
  const ctx = await getAdminContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const tw = tenantWhere(ctx);

  const orders = await prisma.hblOrder.findMany({
    where: { ...tw, ...(status ? { status: status as "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED" } : {}) },
    include: {
      member: { select: { name: true, phone: true, memberCode: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ orders });
}
