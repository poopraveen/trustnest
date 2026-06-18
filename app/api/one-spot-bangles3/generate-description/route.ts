import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { name, category, material, price } = await req.json();

  const prompt = `You are a luxury jewellery copywriter for One Spot Bangles, a premium bangle store in Bangalore.

Write a compelling, elegant product description for:
- Product name: ${name || "Bangle"}
- Category: ${category || "Gold"}
- Material: ${material || "Gold"}
- Price: ₹${price || ""}

Write 2–3 sentences. Be evocative, highlight craftsmanship, cultural heritage, and occasion suitability. Keep it under 60 words. No bullet points. No markdown. Just flowing prose.`;

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Fallback mock description
    const mock = `Exquisitely crafted ${material || "gold"} ${name?.toLowerCase() || "bangle"} that embodies timeless elegance. Perfect for ${category === "Bridal" ? "wedding ceremonies and bridal trousseau" : "festive occasions and everyday luxury"}. A treasured piece from the heart of Bangalore's finest jewellery tradition.`;
    const encoder = new TextEncoder();
    return new Response(
      new ReadableStream({
        start(controller) {
          for (const ch of mock) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: ch })}\n\n`));
          }
          controller.close();
        },
      }),
      { headers: { "Content-Type": "text/event-stream" } }
    );
  }

  const client = new Anthropic({ apiKey });
  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 150,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }
        } finally {
          controller.close();
        }
      },
    }),
    { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
  );
}
