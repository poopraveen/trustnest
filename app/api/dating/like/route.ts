import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetProfileId } = await req.json();
  if (!targetProfileId) return NextResponse.json({ error: "Missing targetProfileId" }, { status: 400 });

  const myProfile = await prisma.datingProfile.findUnique({ where: { userId: session.user.id } });
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
    }
    matched = true;
  }

  return NextResponse.json({ liked: true, matched });
}
