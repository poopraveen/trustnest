import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { phone, otp } = await req.json();
  if (!phone || !otp) return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });

  const record = await prisma.hblOtp.findFirst({
    where: { phone, otp, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  // Allow bypass OTP 123456 for testing
  if (!record && otp !== "123456") {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
  }

  if (record) await prisma.hblOtp.update({ where: { id: record.id }, data: { used: true } });

  const member = await prisma.hblMember.findUnique({ where: { phone } });
  if (!member) return NextResponse.json({ error: "Member not found. Please register with admin." }, { status: 404 });

  const session = await prisma.hblSession.create({
    data: {
      memberId: member.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const res = NextResponse.json({ success: true, member: { id: member.id, name: member.name, plan: member.plan } });
  res.cookies.set("hbl_session", session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
  return res;
}
