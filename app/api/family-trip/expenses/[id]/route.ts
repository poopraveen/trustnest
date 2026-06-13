import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT /api/family-trip/expenses/:id  — update expense
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const expense = await prisma.familyTripExpense.update({
      where: { id: params.id },
      data: {
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

// DELETE /api/family-trip/expenses/:id
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.familyTripExpense.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
