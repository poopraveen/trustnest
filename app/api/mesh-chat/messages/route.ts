import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel") ?? "general";
  const since   = searchParams.get("since");

  try {
    const messages = await prisma.meshMessage.findMany({
      where: {
        channel,
        ...(since ? { createdAt: { gt: new Date(since) } } : {}),
      },
      orderBy: { createdAt: "asc" },
      take: since ? 100 : 80,
    });
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req: NextRequest) {
  const { channel, author, content, priority, status } = await req.json();
  if (!channel || !author || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  try {
    const message = await prisma.meshMessage.create({
      data: {
        channel,
        author: author.trim().slice(0, 40),
        content: content.trim().slice(0, 1000),
        priority: Boolean(priority),
        status: status ?? null,
      },
    });
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
}
