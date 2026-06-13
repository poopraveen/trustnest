import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, chatId, message } = body as {
      token: string;
      chatId: string;
      message: string;
    };

    if (!token || !chatId || !message) {
      return NextResponse.json({ error: "token, chatId, and message are required" }, { status: 400 });
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
    });

    const data = await res.json();
    if (!data.ok) {
      return NextResponse.json({ error: data.description ?? "Telegram error" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
