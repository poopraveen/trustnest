import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone || !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: "Valid 10-digit phone required" }, { status: 400 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.hblOtp.create({ data: { phone, otp, expiresAt } });

  // In production: send SMS. For now return OTP in response (dev mode).
  return NextResponse.json({ success: true, otp, message: "OTP sent (demo mode)" });
}
