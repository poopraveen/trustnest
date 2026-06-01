import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-hbl-admin") === (process.env.HBL_ADMIN_PIN ?? "9999");
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const orders = await prisma.hblOrder.findMany({
    where: status ? { status: status as "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED" } : {},
    include: {
      member: { select: { name: true, phone: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ orders });
}
