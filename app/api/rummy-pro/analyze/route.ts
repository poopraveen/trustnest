import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  // body contains: hand, jokerRank, analysis (the client-side result), openPileTop, playerCount

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    const mockText = `**Strategic Analysis**\n\n**Current Position**\nYour hand has been analyzed by the Rummy Pro AI. Based on the client-side analysis, here is a strategic breakdown.\n\n**Best Move**\nFocus on completing your pure sequence first — this is mandatory for a valid declaration. Without at least one pure sequence, you cannot win regardless of how well your other groups are formed.\n\n**Alternative Move**\nIf you are close to completing a set, consider holding those cards while fishing for the missing suit. Sets give you flexibility since you can use wild jokers here.\n\n**Risk Level**\nMonitor your deadwood points closely. If points exceed 40, consider a defensive strategy of reducing high-value unmatched cards (J/Q/K) before your opponent declares.\n\n**Estimated Turns**\nBased on the current hand composition, aim to declare within 5-8 turns for optimal performance.\n\n**Key Strategic Considerations**\n- Always prioritize completing a pure sequence over everything else\n- Use wild jokers to bridge gaps in impure sequences or sets\n- Watch what opponents pick from the open pile to infer their hand composition\n- Discard high-value unmatched cards (face cards) early to minimize loss if opponent declares`;

    const encoder = new TextEncoder();
    return new Response(
      new ReadableStream({
        start(controller) {
          for (const char of mockText) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: char })}\n\n`)
            );
          }
          controller.close();
        },
      }),
      { headers: { "Content-Type": "text/event-stream" } }
    );
  }

  const client = new Anthropic({ apiKey });

  const prompt = `You are Rummy Pro AI, an expert Indian Rummy strategist. Analyze this hand and provide strategic advice.

Hand: ${body.hand.map((c: { rank: string; suit: string }) => `${c.rank}${c.suit}`).join(", ")}
Wild Joker Rank: ${body.jokerRank ?? "None set"}
Open Pile Top: ${body.openPileTop ? `${body.openPileTop.rank}${body.openPileTop.suit}` : "Unknown"}
Players: ${body.playerCount}

Client Analysis:
- Pure sequences found: ${body.analysis.pureSeqs.length}
- Impure sequences: ${body.analysis.impureSeqs.length}
- Sets: ${body.analysis.sets.length}
- Deadwood points: ${body.analysis.deadwoodPts}
- Best discard suggestion: ${body.analysis.bestDiscard ? `${body.analysis.bestDiscard.rank}${body.analysis.bestDiscard.suit}` : "None"}
- Can declare: ${body.analysis.canDeclare}
- Risk level: ${body.analysis.riskLevel}
- Estimated turns to declare: ${body.analysis.estTurns}

Provide:
1. Current Position assessment
2. Best Move with reasoning
3. Alternative Move
4. Risk Level explanation
5. Estimated Turns to Declare
6. Key strategic considerations

Be concise, specific, and actionable. Use markdown formatting.`;

  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const encoder = new TextEncoder();
    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
              ) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
                  )
                );
              }
            }
          } finally {
            controller.close();
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
