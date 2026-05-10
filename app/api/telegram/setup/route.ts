/**
 * GET /api/telegram/setup
 *
 * Calls /getUpdates with the configured bot token and returns the
 * chat IDs + names from recent messages. Use this to find the correct
 * TELEGRAM_CHAT_ID to put in .env / Vercel.
 *
 * Steps:
 *   1. Open Telegram and send any message to your bot
 *   2. Call this endpoint: /api/telegram/setup
 *   3. Copy the "id" from the "from" or "chat" object
 *   4. Set TELEGRAM_CHAT_ID=<that id> in Vercel env vars
 */

import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return NextResponse.json({
      error: "TELEGRAM_BOT_TOKEN is not set in environment variables",
      fix:   "1. Go to @BotFather on Telegram → /newbot or /mybots → copy the token\n2. Add TELEGRAM_BOT_TOKEN=<token> to Vercel env vars",
    }, { status: 400 });
  }

  try {
    /* 1. Get bot info */
    const meRes  = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meJson = await meRes.json() as { ok: boolean; result?: { id: number; username: string; first_name: string } };

    if (!meJson.ok) {
      return NextResponse.json({
        error: "Invalid TELEGRAM_BOT_TOKEN — bot not found",
        detail: meJson,
      }, { status: 400 });
    }

    /* 2. Get recent updates */
    const updRes  = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=20`);
    const updJson = await updRes.json() as {
      ok: boolean;
      result: Array<{
        message?: {
          chat: { id: number; type: string; first_name?: string; username?: string; title?: string };
          from?: { id: number; first_name?: string; username?: string };
          text?: string;
          date: number;
        };
      }>;
    };

    /* 3. Collect unique chats */
    const chats = new Map<number, { id: number; type: string; name: string; lastMsg?: string }>();
    for (const upd of updJson.result ?? []) {
      const msg = upd.message;
      if (!msg) continue;
      const { chat, from, text } = msg;
      const name = chat.title ?? chat.first_name ?? from?.first_name ?? "Unknown";
      chats.set(chat.id, { id: chat.id, type: chat.type, name, lastMsg: text });
    }

    const chatList = Array.from(chats.values());
    const currentChatId = process.env.TELEGRAM_CHAT_ID || "(not set)";

    return NextResponse.json({
      bot: {
        id:       meJson.result!.id,
        username: meJson.result!.username,
        name:     meJson.result!.first_name,
      },
      currentChatId,
      chatsFound: chatList,
      instructions: chatList.length === 0
        ? "No chats found. Open Telegram, send any message to your bot, then call this endpoint again."
        : `Set TELEGRAM_CHAT_ID=${chatList[0].id} in Vercel env vars (use the chat you want notifications in).`,
    });

  } catch (err) {
    return NextResponse.json({ error: "Failed to reach Telegram API", detail: String(err) }, { status: 500 });
  }
}

/* Also support POST to send a test message */
export async function POST() {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json({
      error: "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set",
    }, { status: 400 });
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id:    chatId,
      text:       "✅ <b>TN Vettri Telegram test</b>\n\nThis confirms your bot is correctly configured for grievance notifications.",
      parse_mode: "HTML",
    }),
  });
  const json = await res.json();
  return NextResponse.json({ ok: json.ok, result: json });
}
