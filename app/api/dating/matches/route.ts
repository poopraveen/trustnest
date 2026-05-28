import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const myProfile = await prisma.datingProfile.findUnique({ where: { userId: session.user.id } });
  if (!myProfile) return NextResponse.json({ matches: [] });

  const matches = await prisma.datingMatch.findMany({
    where: { OR: [{ user1Id: myProfile.id }, { user2Id: myProfile.id }] },
    include: {
      user1: { select: { id: true, displayName: true, photos: true, age: true, city: true, state: true } },
      user2: { select: { id: true, displayName: true, photos: true, age: true, city: true, state: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true, senderId: true, read: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = matches.map((m) => {
    const other = m.user1Id === myProfile.id ? m.user2 : m.user1;
    const lastMsg = m.messages[0] ?? null;
    const unread = lastMsg && lastMsg.senderId !== myProfile.id && !lastMsg.read;
    return { matchId: m.id, profile: other, lastMessage: lastMsg, unread };
  });

  return NextResponse.json({ matches: result });
}
