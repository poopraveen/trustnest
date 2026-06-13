import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/family-trip/trip?code=XXXX  — load or create trip
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  try {
    let trip = await prisma.familyTrip.findUnique({ where: { code } });
    if (!trip) {
      trip = await prisma.familyTrip.create({
        data: { code, name: "Family Trip", members: ["You","Brother","Sister","Dad","Mom"], currency: "₹" },
      });
    }
    return NextResponse.json({ trip });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// PUT /api/family-trip/trip?code=XXXX  — update trip config
export async function PUT(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  try {
    const body = await req.json();
    const { name, members, currency, tgToken, tgChatId, tgEnabled } = body;
    const trip = await prisma.familyTrip.upsert({
      where: { code },
      create: { code, name, members, currency, tgToken, tgChatId, tgEnabled },
      update: { name, members, currency, tgToken, tgChatId, tgEnabled },
    });
    return NextResponse.json({ trip });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
