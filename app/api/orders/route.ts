export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage, buildOrderMessage } from "@/lib/telegram";
import { z } from "zod";

const OrderSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1),
    price: z.number().positive(),
    title: z.string(),
    image: z.string().nullable().optional(),
  })).min(1),
});

export async function POST(req: NextRequest) {
  // No auth required — guests can checkout
  const session = await getServerSession(authOptions);

  try {
    const body = await req.json();
    const parsed = OrderSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const { name, phone, address, notes, items } = parsed.data;

    const cleaned = phone.replace(/\s+/g, "").replace(/^(\+91|91|0)/, "");
    if (!/^\d{10}$/.test(cleaned)) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 });
    }

    // Verify products exist and are APPROVED
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "APPROVED" },
      select: { id: true, title: true, price: true, stock: true },
    });
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "One or more products are unavailable" }, { status: 400 });
    }

    const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);

    const orderData: any = {
      userId: session?.user?.id ?? null,
      name: name.trim(),
      phone: cleaned,
      address: address ?? null,
      notes: notes ?? null,
      totalAmount,
      items: {
        create: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          title: i.title,
          image: i.image ?? null,
        })),
      },
    };
    const order = await prisma.order.create({ data: orderData, include: { items: true } });

    // Telegram notification (fire-and-forget)
    sendTelegramMessage({
      text: buildOrderMessage({
        orderId: order.id,
        buyerName: name.trim(),
        buyerEmail: session?.user?.email ?? "guest",
        phone: cleaned,
        address,
        notes,
        items,
        totalAmount,
      }),
    }).catch(() => {});

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (err) {
    console.error("[orders] create error:", err);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: { include: { product: { select: { id: true, title: true, images: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
