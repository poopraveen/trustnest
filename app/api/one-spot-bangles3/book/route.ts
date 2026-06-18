import { NextRequest, NextResponse } from "next/server";

async function getPrisma() {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.$connect();
    return prisma;
  } catch {
    return null;
  }
}

async function sendTelegramNotification(booking: {
  productName: string;
  price: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  note?: string;
}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) return false;

  const priceFormatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(booking.price);

  const text = [
    `💍 *New Bangle Booking!*`,
    ``,
    `*Product:* ${booking.productName}`,
    `*Price:* ${priceFormatted}`,
    ``,
    `👤 *Customer Details*`,
    `*Name:* ${booking.customerName}`,
    `*Phone:* ${booking.customerPhone}`,
    booking.customerEmail ? `*Email:* ${booking.customerEmail}` : null,
    booking.note ? `*Note:* ${booking.note}` : null,
    ``,
    `📅 ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST`,
    ``,
    `_Respond quickly to confirm the order!_ 🙏`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
        }),
      }
    );
    const data = await res.json();
    return data.ok === true;
  } catch (e) {
    console.error("Telegram notification failed:", e);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, productName, price, customerName, customerPhone, customerEmail, note } = body;

    if (!productName || !price || !customerName || !customerPhone) {
      return NextResponse.json(
        { error: "productName, price, customerName and customerPhone are required" },
        { status: 400 }
      );
    }

    // Save booking to DB
    let bookingId: string | null = null;
    const prisma = await getPrisma();
    if (prisma) {
      try {
        const booking = await prisma.bangleBooking.create({
          data: {
            productId: productId ?? "unknown",
            productName,
            price: Number(price),
            customerName,
            customerPhone,
            customerEmail: customerEmail || null,
            note: note || null,
            status: "pending",
          },
        });
        bookingId = booking.id;
      } catch (e) {
        console.error("DB booking error:", e);
      } finally {
        await prisma.$disconnect();
      }
    }

    // Send Telegram notification
    const notified = await sendTelegramNotification({
      productName,
      price: Number(price),
      customerName,
      customerPhone,
      customerEmail,
      note,
    });

    return NextResponse.json({
      ok: true,
      bookingId,
      notified,
      message: "Booking confirmed! The store owner has been notified.",
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
