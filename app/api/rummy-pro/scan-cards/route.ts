import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CARD_PROMPT = `You are a playing card recognition system. Look at this image of playing cards and identify each card.

Return ONLY a valid JSON array — no explanation, no markdown, no code fences. Format:
[{"rank":"A","suit":"♠"},{"rank":"5","suit":"♥"},...]

Rules:
- Valid ranks: A 2 3 4 5 6 7 8 9 10 J Q K
- Valid suits: ♠ ♥ ♦ ♣
- Printed joker (jester card): {"rank":"PJ","suit":"🃏"}
- Only include cards you can clearly see
- Maximum 14 cards
- Return ONLY the JSON array, nothing else`;

function parseCards(raw: string) {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const arr = JSON.parse(match[0]);
    return Array.isArray(arr) && arr.length > 0 ? arr : null;
  } catch {
    return null;
  }
}

async function scanWithClaude(imageBase64: string, mediaType: string, apiKey: string) {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif", data: imageBase64 } },
        { type: "text", text: CARD_PROMPT },
      ],
    }],
  });
  return response.content[0].type === "text" ? response.content[0].text.trim() : "";
}

async function scanWithGemini(imageBase64: string, mediaType: string, apiKey: string) {
  // Google Gemini Flash — free tier (1500 req/day, no billing required)
  // Get a free key at: https://aistudio.google.com/app/apikey
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: mediaType, data: imageBase64 } },
          { text: CARD_PROMPT },
        ],
      }],
      generationConfig: { maxOutputTokens: 600, temperature: 0 },
    }),
  });
  const data = await res.json();
  return (data.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined)?.trim() ?? "";
}

async function scanWithHuggingFace(imageBase64: string, apiKey: string) {
  // Hugging Face Inference API — free tier (rate-limited)
  // Get a free key at: https://huggingface.co/settings/tokens
  // Uses Llava-1.5 (open-source vision model by Haotian Liu et al.)
  const res = await fetch(
    "https://api-inference.huggingface.co/models/llava-hf/llava-1.5-7b-hf",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {
          image: imageBase64,
          prompt: `USER: <image>\n${CARD_PROMPT}\nASSISTANT:`,
        },
        parameters: { max_new_tokens: 400 },
      }),
    }
  );
  if (!res.ok) throw new Error(`HuggingFace error: ${res.status}`);
  const data = await res.json();
  const text = Array.isArray(data) ? (data[0]?.generated_text ?? "") : (data?.generated_text ?? "");
  // Strip the prompt from the response
  const assistantIdx = text.lastIndexOf("ASSISTANT:");
  return assistantIdx >= 0 ? text.slice(assistantIdx + 10).trim() : text.trim();
}

export async function POST(req: NextRequest) {
  let imageBase64: string;
  let mediaType: string;

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "No image provided" }, { status: 400 });
    const bytes = await file.arrayBuffer();
    imageBase64 = Buffer.from(bytes).toString("base64");
    mediaType = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)
      ? file.type
      : "image/jpeg";
  } catch {
    return NextResponse.json({ error: "Failed to read image" }, { status: 400 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GOOGLE_AI_API_KEY;
  const hfKey = process.env.HUGGINGFACE_API_KEY;

  let raw = "";
  let provider = "";

  try {
    if (anthropicKey) {
      raw = await scanWithClaude(imageBase64, mediaType, anthropicKey);
      provider = "Claude Vision";
    } else if (geminiKey) {
      raw = await scanWithGemini(imageBase64, mediaType, geminiKey);
      provider = "Gemini Flash (free)";
    } else if (hfKey) {
      raw = await scanWithHuggingFace(imageBase64, hfKey);
      provider = "Llava-1.5 (HuggingFace free)";
    } else {
      return NextResponse.json({
        error: "No vision API configured. Add one of these environment variables:",
        options: [
          { env: "ANTHROPIC_API_KEY", name: "Claude Vision", cost: "Paid — best accuracy" },
          { env: "GOOGLE_AI_API_KEY", name: "Gemini Flash", cost: "Free — 1500 req/day, get key at aistudio.google.com" },
          { env: "HUGGINGFACE_API_KEY", name: "Llava-1.5 (open-source)", cost: "Free — rate limited, get key at huggingface.co/settings/tokens" },
        ],
      }, { status: 503 });
    }

    const cards = parseCards(raw);
    if (!cards) {
      return NextResponse.json({
        error: "Could not identify cards in image. Try better lighting or a closer shot.",
        provider,
      }, { status: 422 });
    }

    return NextResponse.json({ cards, count: cards.length, provider });
  } catch (e) {
    return NextResponse.json({ error: String(e), provider }, { status: 500 });
  }
}
