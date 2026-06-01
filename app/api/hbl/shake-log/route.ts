import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getMember(req: NextRequest) {
  const token = req.cookies.get("hbl_session")?.value;
  if (!token) return null;
  const session = await prisma.hblSession.findUnique({ where: { token }, include: { member: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.member;
}

export async function POST(req: NextRequest) {
  const member = await getMember(req);
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, notes } = await req.json();

  const log = await prisma.hblShakeLog.create({
    data: { memberId: member.id, productId: productId ?? null, notes },
  });

  return NextResponse.json({ success: true, log }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const member = await getMember(req);
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await prisma.hblShakeLog.findMany({
    where: { memberId: member.id },
    include: { product: { select: { name: true, sku: true } } },
    orderBy: { loggedAt: "desc" },
    take: 30,
  });
  return NextResponse.json({ logs });
}
