import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Vision API not configured. Set ANTHROPIC_API_KEY in environment." },
      { status: 503 }
    );
  }

  let imageBase64: string;
  let mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    imageBase64 = Buffer.from(bytes).toString("base64");
    const mt = file.type;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mt)) {
      mediaType = "image/jpeg";
    } else {
      mediaType = mt as typeof mediaType;
    }
  } catch {
    return NextResponse.json({ error: "Failed to read image" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: imageBase64 },
            },
            {
              type: "text",
              text: `You are a playing card recognition system. Look at this image of playing cards and identify each card.

Return ONLY a valid JSON array — no explanation, no markdown, no code fences. Format:
[{"rank":"A","suit":"♠"},{"rank":"5","suit":"♥"},...]

Rules:
- Valid ranks: A 2 3 4 5 6 7 8 9 10 J Q K
- Valid suits: ♠ ♥ ♦ ♣
- Printed joker (jester card): {"rank":"PJ","suit":"🃏"}
- Only include cards you can clearly see
- Maximum 14 cards
- Return ONLY the JSON array, nothing else`,
            },
          ],
        },
      ],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text.trim() : "";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not identify cards in image. Try better lighting or a clearer shot.", raw }, { status: 422 });
    }

    const cards = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: "No cards detected. Try better lighting or a closer shot.", raw }, { status: 422 });
    }

    return NextResponse.json({ cards, count: cards.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
