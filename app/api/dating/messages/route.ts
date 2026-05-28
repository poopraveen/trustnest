import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });

  const myProfile = await prisma.datingProfile.findUnique({ where: { userId: session.user.id } });
  if (!myProfile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const match = await prisma.datingMatch.findFirst({
    where: {
      id: matchId,
      OR: [{ user1Id: myProfile.id }, { user2Id: myProfile.id }],
    },
  });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const messages = await prisma.datingMessage.findMany({
    where: { matchId },
    orderBy: { createdAt: "asc" },
  });

  await prisma.datingMessage.updateMany({
    where: { matchId, senderId: { not: myProfile.id }, read: false },
    data: { read: true },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId, content } = await req.json();
  if (!matchId || !content?.trim()) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const myProfile = await prisma.datingProfile.findUnique({ where: { userId: session.user.id } });
  if (!myProfile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const match = await prisma.datingMatch.findFirst({
    where: {
      id: matchId,
      OR: [{ user1Id: myProfile.id }, { user2Id: myProfile.id }],
    },
  });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const message = await prisma.datingMessage.create({
    data: { matchId, senderId: myProfile.id, content: content.trim() },
  });

  return NextResponse.json({ message });
}
