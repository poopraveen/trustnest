import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminContext } from "@/lib/hbl-tenant";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getAdminContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  for (const k of ["name", "nameTa", "price", "mrp", "stock", "minStock", "isActive", "imageUrl"]) {
    if (k in body) allowed[k] = body[k];
  }
  const product = await prisma.hblProduct.update({ where: { id: params.id }, data: allowed });
  return NextResponse.json({ product });
}
