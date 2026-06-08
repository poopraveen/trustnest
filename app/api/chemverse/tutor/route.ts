import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

export async function POST(req: NextRequest) {
  const { messages, mode } = await req.json();
  if (!messages?.length) return NextResponse.json({ error: "No messages" }, { status: 400 });

  const systemPrompts: Record<string, string> = {
    tutor: `You are ChemVerse AI — an expert chemistry tutor for all levels (high school through university).
You explain concepts clearly with examples. When solving problems, show step-by-step working.
Use chemical formulas and equations where appropriate (plain text, no LaTeX).
Keep responses concise but complete. Always encourage curiosity.`,
    quiz: `You are ChemVerse Quiz Master. Generate chemistry quiz questions.
Format each question as: Q: [question] | A: [answer] | Difficulty: [Easy/Medium/Hard] | Topic: [topic]
Generate 5 questions per request unless specified otherwise.`,
    predict: `You are a chemistry reaction predictor. Given reactants, predict likely products,
explain the reaction type (acid-base, redox, precipitation, combustion, etc.),
show the balanced equation, and explain the mechanism briefly.`,
  };

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompts[mode] ?? systemPrompts.tutor },
        ...messages,
      ],
      stream: true,
      max_tokens: 1200,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
