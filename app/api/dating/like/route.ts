import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/dating-notifications";
import { sendMatchEmail } from "@/lib/dating-mailer";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetProfileId } = await req.json();
  if (!targetProfileId) return NextResponse.json({ error: "Missing targetProfileId" }, { status: 400 });

  const myProfile = await prisma.datingProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!myProfile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const existing = await prisma.datingLike.findUnique({
    where: { senderId_receiverId: { senderId: myProfile.id, receiverId: targetProfileId } },
  });

  if (existing) {
    await prisma.datingLike.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false, matched: false });
  }

  await prisma.datingLike.create({ data: { senderId: myProfile.id, receiverId: targetProfileId } });

  const mutualLike = await prisma.datingLike.findUnique({
    where: { senderId_receiverId: { senderId: targetProfileId, receiverId: myProfile.id } },
  });

  let matched = false;
  if (mutualLike) {
    const [u1, u2] = [myProfile.id, targetProfileId].sort();
    const existingMatch = await prisma.datingMatch.findUnique({
      where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
    });

    if (!existingMatch) {
      await prisma.datingMatch.create({ data: { user1Id: u1, user2Id: u2 } });

      // Fetch other profile's user info for notifications + email
      const otherProfile = await prisma.datingProfile.findUnique({
        where: { id: targetProfileId },
        include: { user: { select: { id: true, email: true, name: true } } },
      });

      if (otherProfile) {
        // In-app notifications for both parties
        await Promise.all([
          createNotification(
            session.user.id,
            "NEW_MATCH",
            `You matched with ${otherProfile.displayName}! 💕`,
            `You and ${otherProfile.displayName} liked each other. Say hello!`,
            "/dating/matches"
          ),
          createNotification(
            otherProfile.user.id,
            "NEW_MATCH",
            `You matched with ${myProfile.displayName}! 💕`,
            `You and ${myProfile.displayName} liked each other. Say hello!`,
            "/dating/matches"
          ),
        ]);

        // Email both parties (fire-and-forget)
        const myUser = myProfile.user;
        sendMatchEmail(myUser.email, myUser.name ?? myProfile.displayName, otherProfile.displayName);
        sendMatchEmail(otherProfile.user.email, otherProfile.user.name ?? otherProfile.displayName, myProfile.displayName);
      }
    }
    matched = true;
  }

  return NextResponse.json({ liked: true, matched });
}
