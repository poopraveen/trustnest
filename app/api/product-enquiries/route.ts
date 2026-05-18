export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage, buildProductEnquiryMessage } from "@/lib/telegram";
import { getProductCategoryLabel } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, message, productId } = body;

    if (!name?.trim() || !phone?.trim() || !productId) {
      return NextResponse.json({ error: "Name, phone, and productId are required" }, { status: 400 });
    }

    const cleaned = phone.replace(/\s+/g, "").replace(/^(\+91|91|0)/, "");
    if (!/^\d{10}$/.test(cleaned)) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 });
    }

    const existing = await prisma.productEnquiry.findFirst({
      where: {
        productId,
        phone: cleaned,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (existing) {
      return NextResponse.json({ message: "Enquiry already submitted. The seller will contact you shortly." });
    }

    const [enquiry, product] = await Promise.all([
      prisma.productEnquiry.create({
        data: {
          name: name.trim(),
          phone: cleaned,
          email: email?.trim() || null,
          message: message?.trim() || null,
          productId,
        },
      }),
      prisma.product.findUnique({
        where: { id: productId },
        select: { title: true, category: true, price: true },
      }),
    ]);

    if (product) {
      sendTelegramMessage({
        text: buildProductEnquiryMessage({
          name: name.trim(),
          phone: cleaned,
          email: email?.trim() || null,
          message: message?.trim() || null,
          productTitle: product.title,
          productId,
          category: getProductCategoryLabel(product.category),
          price: product.price,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, id: enquiry.id });
  } catch (error) {
    console.error("Product enquiry error:", error);
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const enquiries = await prisma.productEnquiry.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(enquiries);
}
