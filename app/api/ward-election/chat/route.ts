export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  chatWardElection,
  chatWardElectionStream,
  type WardChatMessage,
} from "@/lib/ward-election-ai";
import { ALL_WARDS } from "@/lib/ward-election-data";
import { isValidAreaId } from "@/lib/ward-election-areas";
import { ANALYTICS_BY_AREA } from "@/lib/ward-election-analytics";

/** Health / config check for the chat UI. */
export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    wardsLoaded: ALL_WARDS.length,
    voterSample: ANALYTICS_BY_AREA,
    features: ["tools", "stream", "voter_json_search"],
  });
}

function parseBody(body: {
  messages?: WardChatMessage[];
  areaFocus?: string;
  stream?: boolean;
}) {
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const sanitized: WardChatMessage[] = messages
    .filter(
      (m): m is WardChatMessage =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, 4000),
    }));

  let areaFocus: "veppampattu" | "perumalpattu" | "all" = "all";
  if (body.areaFocus && body.areaFocus !== "all" && isValidAreaId(body.areaFocus)) {
    areaFocus = body.areaFocus as "veppampattu" | "perumalpattu";
  }

  return { sanitized, areaFocus, stream: Boolean(body.stream) };
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured. Add it to your environment." },
      { status: 503 }
    );
  }

  if (ALL_WARDS.length === 0) {
    return NextResponse.json({ error: "No ward data available." }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    messages?: WardChatMessage[];
    areaFocus?: string;
    stream?: boolean;
  };

  const { sanitized, areaFocus, stream } = parseBody(body);

  if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== "user") {
    return NextResponse.json({ error: "Send at least one user message." }, { status: 400 });
  }

  const input = { messages: sanitized, areaFocus };

  if (stream) {
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of chatWardElectionStream(input)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          }
        } catch (err) {
          console.error("[ward-election/chat] stream error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: "Chat failed" })}\n\n`
            )
          );
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  try {
    const { reply, toolsUsed } = await chatWardElection(input);
    return NextResponse.json({ reply, areaFocus, toolsUsed });
  } catch (err) {
    console.error("[ward-election/chat] OpenAI error:", err);
    return NextResponse.json(
      { error: "Chat request failed. Please try again." },
      { status: 500 }
    );
  }
}
