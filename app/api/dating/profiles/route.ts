import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const verification = await prisma.courtCaseVerification.findUnique({
    where: { userId: session.user.id },
  });
  if (!verification || verification.status !== "VERIFIED") {
    return NextResponse.json({ error: "Not verified" }, { status: 403 });
  }

  const myProfile = await prisma.datingProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!myProfile) {
    return NextResponse.json({ error: "Complete your profile first" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const gender = searchParams.get("gender");
  const city = searchParams.get("city");
  const minAge = searchParams.get("minAge");
  const maxAge = searchParams.get("maxAge");
  const cursor = searchParams.get("cursor");

  const profiles = await prisma.datingProfile.findMany({
    where: {
      userId: { not: session.user.id },
      isVisible: true,
      isComplete: true,
      ...(gender ? { gender: gender as never } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" as never } } : {}),
      ...(minAge || maxAge
        ? {
            age: {
              ...(minAge ? { gte: parseInt(minAge) } : {}),
              ...(maxAge ? { lte: parseInt(maxAge) } : {}),
            },
          }
        : {}),
    },
    select: {
      id: true,
      displayName: true,
      age: true,
      gender: true,
      city: true,
      state: true,
      bio: true,
      photos: true,
      height: true,
      religion: true,
      motherTongue: true,
      education: true,
      occupation: true,
      goals: true,
      hasChildren: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const likedIds = await prisma.datingLike.findMany({
    where: { senderId: myProfile.id },
    select: { receiverId: true },
  });
  const likedSet = new Set(likedIds.map((l) => l.receiverId));

  const result = profiles.map((p) => ({ ...p, liked: likedSet.has(p.id) }));

  return NextResponse.json({ profiles: result, nextCursor: profiles[profiles.length - 1]?.id ?? null });
}
