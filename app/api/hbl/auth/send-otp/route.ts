import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { phone, tenantId } = await req.json();
  if (!phone || !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: "Valid 10-digit phone required" }, { status: 400 });
  }

  // Verify member exists in this tenant (or globally if no tenantId)
  const memberWhere = tenantId ? { phone, tenantId } : { phone };
  const member = await prisma.hblMember.findFirst({ where: memberWhere });
  if (!member) {
    return NextResponse.json({ error: "Member not found. Please register with your club admin." }, { status: 404 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.hblOtp.create({ data: { phone, tenantId: tenantId ?? null, otp, expiresAt } });

  return NextResponse.json({ success: true, otp, message: "OTP sent (demo mode)" });
}
