import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/dating-notifications";
import { sendMessageEmail } from "@/lib/dating-mailer";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });

  const myProfile = await prisma.datingProfile.findUnique({ where: { userId: session.user.id } });
  if (!myProfile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const match = await prisma.datingMatch.findFirst({
    where: { id: matchId, OR: [{ user1Id: myProfile.id }, { user2Id: myProfile.id }] },
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

  const myProfile = await prisma.datingProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } },
  });
  if (!myProfile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const match = await prisma.datingMatch.findFirst({
    where: { id: matchId, OR: [{ user1Id: myProfile.id }, { user2Id: myProfile.id }] },
  });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const message = await prisma.datingMessage.create({
    data: { matchId, senderId: myProfile.id, content: content.trim() },
  });

  // Notify the other person
  const otherProfileId = match.user1Id === myProfile.id ? match.user2Id : match.user1Id;
  const otherProfile = await prisma.datingProfile.findUnique({
    where: { id: otherProfileId },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (otherProfile) {
    // Check if there's already an unread message notification from this sender to avoid spam
    const recentUnread = await prisma.datingNotification.findFirst({
      where: {
        userId: otherProfile.user.id,
        type: "NEW_MESSAGE",
        read: false,
        link: `/dating/matches`,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!recentUnread) {
      await createNotification(
        otherProfile.user.id,
        "NEW_MESSAGE",
        `New message from ${myProfile.displayName}`,
        content.trim().slice(0, 100),
        "/dating/matches"
      );
      // Email (fire-and-forget)
      sendMessageEmail(
        otherProfile.user.email,
        otherProfile.user.name ?? otherProfile.displayName,
        myProfile.displayName,
        content.trim(),
        matchId
      );
    }
  }

  return NextResponse.json({ message });
}
