import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateTicket() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `VEP-${date}-${rand}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const take = 30;

  const requests = await prisma.communityServiceRequest.findMany({
    where: { ...(status ? { status: status as never } : {}) },
    orderBy: { createdAt: "desc" },
    take,
    skip: (page - 1) * take,
  });

  const total = await prisma.communityServiceRequest.count({
    where: { ...(status ? { status: status as never } : {}) },
  });

  return NextResponse.json({ requests, total });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, mobile, ward, serviceKey, serviceName, category, details } = body;

  if (!name?.trim() || !mobile?.trim() || !serviceKey || !serviceName || !category) {
    return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
  }
  if (!/^\d{10}$/.test(mobile.replace(/\s/g, ""))) {
    return NextResponse.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });
  }

  const ticketNo = generateTicket();

  const request = await prisma.communityServiceRequest.create({
    data: {
      ticketNo,
      name: name.trim(),
      mobile: mobile.replace(/\s/g, ""),
      ward: ward?.trim() ?? null,
      serviceKey,
      serviceName,
      category,
      details: details?.trim() ?? null,
    },
  });

  return NextResponse.json({ request, ticketNo });
}
