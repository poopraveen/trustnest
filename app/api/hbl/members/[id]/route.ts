import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-hbl-admin") === (process.env.HBL_ADMIN_PIN ?? "9999");
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const member = await prisma.hblMember.findUnique({
    where: { id: params.id },
    include: { checkIns: { orderBy: { checkedAt: "desc" }, take: 7 }, orders: { orderBy: { createdAt: "desc" }, take: 5 }, payments: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ member });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  for (const k of ["name", "email", "plan", "status", "points", "expiresAt"]) {
    if (k in body) allowed[k] = k === "expiresAt" ? new Date(body[k]) : body[k];
  }
  const member = await prisma.hblMember.update({ where: { id: params.id }, data: allowed });
  return NextResponse.json({ member });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.hblMember.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
