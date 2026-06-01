import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-hbl-admin") === (process.env.HBL_ADMIN_PIN ?? "9999");
}

function generateQr(phone: string) {
  return `HBL-${phone}-${Date.now()}`;
}

function defaultExpiry(plan: string) {
  const months = plan === "PLATINUM" ? 12 : plan === "GOLD" ? 6 : plan === "SILVER" ? 3 : 1;
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? undefined;

  const members = await prisma.hblMember.findMany({
    where: {
      ...(status ? { status: status as "ACTIVE" | "EXPIRED" | "SUSPENDED" } : {}),
      ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, phone, email, plan = "BASIC" } = await req.json();
  if (!name || !phone) return NextResponse.json({ error: "Name and phone required" }, { status: 400 });

  const member = await prisma.hblMember.create({
    data: {
      name, phone, email,
      plan,
      qrCode: generateQr(phone),
      expiresAt: defaultExpiry(plan),
    },
  });
  return NextResponse.json({ member }, { status: 201 });
}
