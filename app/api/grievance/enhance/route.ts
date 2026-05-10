/**
 * POST /api/grievance/enhance
 *
 * Takes the user's raw title + description + category and returns
 * AI-enhanced versions using OpenAI. Only the user's provided facts
 * are used — the AI corrects wording and expands for clarity only.
 *
 * Body: { title, description, category }
 * Response: { title, description }
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 503 }
    );
  }

  const { title, description, category } = await req.json() as {
    title?: string;
    description?: string;
    category?: string;
  };

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const catLabel = (category ?? "general")
    .replace(/-/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());

  const openai = new OpenAI({ apiKey });

  const prompt = `You are a senior Tamil Nadu government advocate with 20 years of experience drafting citizen grievance petitions for District Collectors.

A citizen has submitted the following grievance details:

CATEGORY: ${catLabel}
SUBJECT (user's exact words): "${title.trim()}"
DESCRIPTION (user's exact words): "${(description ?? "").trim() || "(not provided)"}"

Your task:
1. Rewrite the SUBJECT as a single clear, formal, court-appropriate sentence (max 120 characters). Correct grammar. Keep the core fact.
2. Rewrite the DESCRIPTION in 3–5 sentences. Expand on the user's facts in formal petition language suitable for a District Collector. Do NOT invent facts not mentioned by the user. Correct grammar and spelling. Make it clear what the problem is, its impact, and what action is expected.

Respond ONLY with a valid JSON object in this exact format (no extra text):
{
  "title": "<enhanced subject>",
  "description": "<enhanced description>"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model:       "gpt-4o-mini",
      messages:    [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens:  400,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    const result  = JSON.parse(content) as { title?: string; description?: string };

    if (!result.title) {
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 });
    }

    return NextResponse.json({
      title:       result.title.trim(),
      description: (result.description ?? "").trim(),
    });
  } catch (err) {
    console.error("[enhance] OpenAI error:", err);
    return NextResponse.json({ error: "AI enhancement failed" }, { status: 500 });
  }
}
