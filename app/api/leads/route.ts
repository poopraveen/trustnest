export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage, buildLeadMessage } from "@/lib/telegram";

// POST /api/leads — submit a lead (contact seller enquiry)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, message, propertyId, source } = body;

    if (!name?.trim() || !phone?.trim() || !propertyId) {
      return NextResponse.json({ error: "Name, phone, and propertyId are required" }, { status: 400 });
    }

    // Validate Indian phone number (basic)
    const cleaned = phone.replace(/\s+/g, "").replace(/^(\+91|91|0)/, "");
    if (!/^\d{10}$/.test(cleaned)) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 });
    }

    // Prevent duplicate leads from same phone within 24h for same property
    const existing = await prisma.lead.findFirst({
      where: {
        propertyId,
        phone: cleaned,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (existing) {
      return NextResponse.json({ message: "Enquiry already submitted. The seller will contact you shortly." });
    }

    const [lead, property] = await Promise.all([
      prisma.lead.create({
        data: {
          name: name.trim(),
          phone: cleaned,
          email: email?.trim() || null,
          message: message?.trim() || null,
          propertyId,
          source: source ?? "website",
        },
      }),
      prisma.property.findUnique({
        where: { id: propertyId },
        select: { title: true, city: true, listingType: true, price: true },
      }),
    ]);

    // Fire-and-forget Telegram notification
    if (property) {
      sendTelegramMessage({
        text: buildLeadMessage({
          name: name.trim(),
          phone: cleaned,
          email: email?.trim() || null,
          message: message?.trim() || null,
          propertyTitle: property.title,
          propertyId,
          city: property.city,
          listingType: property.listingType,
          price: property.price,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, id: lead.id });
  } catch (error) {
    console.error("Lead creation error:", error);
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }
}

// GET /api/leads?propertyId=xxx — seller fetches their leads
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");
  const status = searchParams.get("status");

  if (!propertyId) {
    return NextResponse.json({ error: "propertyId required" }, { status: 400 });
  }

  try {
    const leads = await prisma.lead.findMany({
      where: {
        propertyId,
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(leads);
  } catch {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
