import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.datingProfile.findUnique({
    where: { userId: session.user.id },
  });
  const verification = await prisma.courtCaseVerification.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ profile, verification });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const verification = await prisma.courtCaseVerification.findUnique({
    where: { userId: session.user.id },
  });
  if (!verification || verification.status !== "VERIFIED") {
    return NextResponse.json({ error: "Your court case verification is not yet approved." }, { status: 403 });
  }

  const body = await req.json();
  const {
    displayName, age, gender, city, state, bio, photos,
    height, religion, motherTongue, education, occupation,
    incomeRange, hasChildren, wantsChildren, goals,
    lookingForGender, minAge, maxAge,
  } = body;

  if (!displayName || !age || !gender || !city || !state) {
    return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
  }

  const existing = await prisma.datingProfile.findUnique({ where: { userId: session.user.id } });

  const data = {
    displayName,
    age: parseInt(age),
    gender,
    city,
    state,
    bio: bio ?? null,
    photos: photos ?? [],
    height: height ? parseInt(height) : null,
    religion: religion ?? null,
    motherTongue: motherTongue ?? null,
    education: education ?? null,
    occupation: occupation ?? null,
    incomeRange: incomeRange ?? null,
    hasChildren: hasChildren ?? false,
    wantsChildren: wantsChildren ?? null,
    goals: goals ?? "SERIOUS_RELATIONSHIP",
    lookingForGender: lookingForGender ?? null,
    minAge: minAge ? parseInt(minAge) : null,
    maxAge: maxAge ? parseInt(maxAge) : null,
    isComplete: true,
  };

  const profile = existing
    ? await prisma.datingProfile.update({ where: { userId: session.user.id }, data })
    : await prisma.datingProfile.create({ data: { userId: session.user.id, ...data } });

  return NextResponse.json({ profile });
}
