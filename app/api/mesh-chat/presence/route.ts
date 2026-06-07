import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId, name, channel, status } = await req.json();
  if (!userId || !name) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    await prisma.meshPresence.upsert({
      where:  { userId },
      update: { name, channel, status: status ?? "active", lastSeen: new Date() },
      create: { userId, name, channel: channel ?? "general", status: status ?? "active" },
    });
    // Prune stale users (> 30s ago)
    await prisma.meshPresence.deleteMany({
      where: { lastSeen: { lt: new Date(Date.now() - 30_000) } },
    });
  } catch { /* offline — ignore */ }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  try {
    const users = await prisma.meshPresence.findMany({
      where: { lastSeen: { gt: new Date(Date.now() - 30_000) } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ users: [] });
  }
}
