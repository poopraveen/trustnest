import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-hbl-admin") === (process.env.HBL_ADMIN_PIN ?? "9999");
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  for (const k of ["name", "nameTa", "price", "stock", "minStock", "isActive", "imageUrl"]) {
    if (k in body) allowed[k] = body[k];
  }
  const product = await prisma.hblProduct.update({ where: { id: params.id }, data: allowed });
  return NextResponse.json({ product });
}
