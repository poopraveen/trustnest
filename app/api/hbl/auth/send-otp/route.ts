import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function sendSmsOtp(phone: string, otp: string): Promise<boolean> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) return false;

  try {
    const url = new URL("https://www.fast2sms.com/dev/bulkV2");
    url.searchParams.set("authorization", apiKey);
    url.searchParams.set("variables_values", otp);
    url.searchParams.set("route", "otp");
    url.searchParams.set("numbers", phone);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { "cache-control": "no-cache" },
    });
    const data = await res.json();
    return data.return === true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const { phone, tenantId } = await req.json();
  if (!phone || !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: "Valid 10-digit phone required" }, { status: 400 });
  }

  const memberWhere = tenantId ? { phone, tenantId } : { phone };
  const member = await prisma.hblMember.findFirst({ where: memberWhere });
  if (!member) {
    return NextResponse.json({ error: "Member not found. Please register with your club admin." }, { status: 404 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.hblOtp.create({ data: { phone, tenantId: tenantId ?? null, otp, expiresAt } });

  const smsSent = await sendSmsOtp(phone, otp);

  if (smsSent) {
    // Real SMS sent — don't expose OTP in response
    return NextResponse.json({ success: true, message: "OTP sent to your mobile" });
  } else {
    // Demo mode — show OTP on screen
    return NextResponse.json({ success: true, otp, message: "OTP sent (demo mode)" });
  }
}
