export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { generateWardStrategy } from "@/lib/ward-election-ai";
import { ELECTION_META, WARDS, CANDIDATES } from "@/lib/ward-election-data";

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 503 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    objective?: string;
    party?: string;
  };

  if (WARDS.length === 0) {
    return NextResponse.json(
      { error: "No ward data available. Add records to lib/ward-election-data.ts first." },
      { status: 400 }
    );
  }

  try {
    const { strategy } = await generateWardStrategy({
      meta: ELECTION_META,
      wards: WARDS,
      candidates: CANDIDATES,
      objective: body.objective?.trim() || undefined,
      party: body.party?.trim() || undefined,
    });

    return NextResponse.json({ strategy });
  } catch (err) {
    console.error("[ward-election/strategy] OpenAI error:", err);
    return NextResponse.json(
      { error: "Strategy generation failed" },
      { status: 500 }
    );
  }
}
