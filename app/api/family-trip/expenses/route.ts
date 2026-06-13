import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/family-trip/expenses?code=XXXX
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  try {
    const trip = await prisma.familyTrip.findUnique({ where: { code }, include: { expenses: { orderBy: { date: "desc" } } } });
    if (!trip) return NextResponse.json({ expenses: [] });
    return NextResponse.json({ expenses: trip.expenses });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/family-trip/expenses?code=XXXX  — create expense
export async function POST(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  try {
    const body = await req.json();
    const trip = await prisma.familyTrip.findUnique({ where: { code } });
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const expense = await prisma.familyTripExpense.create({
      data: {
        tripId: trip.id,
        description: body.description,
        amount: parseFloat(body.amount),
        category: body.category,
        paidBy: body.paidBy,
        date: body.date,
        note: body.note || "",
        location: body.location || "",
      },
    });
    return NextResponse.json({ expense });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
