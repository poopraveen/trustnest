import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-hbl-admin") === (process.env.HBL_ADMIN_PIN ?? "9999");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("active") !== "false";
  const products = await prisma.hblProduct.findMany({
    where: activeOnly ? { isActive: true } : {},
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, nameTa, category, price, stock, minStock, imageUrl } = await req.json();
  if (!name || !category || price === undefined) return NextResponse.json({ error: "name, category, price required" }, { status: 400 });
  const product = await prisma.hblProduct.create({ data: { name, nameTa, category, price, stock: stock ?? 0, minStock: minStock ?? 10, imageUrl } });
  return NextResponse.json({ product }, { status: 201 });
}
