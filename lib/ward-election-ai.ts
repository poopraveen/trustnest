import OpenAI from "openai";
import type { Ward, Candidate, ElectionMeta } from "@/lib/ward-election-data";

// Lazy singleton — instantiated only at call time, never at build time.
let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export interface StrategyInput {
  meta: ElectionMeta;
  wards: Ward[];
  candidates: Candidate[];
  objective?: string; // free-text goal, e.g. "Maximise turnout in low-margin wards"
  party?: string; // the party/candidate the strategy is being built for
}

export interface TargetWard {
  wardId: string;
  name: string;
  priority: "high" | "medium" | "low";
  rationale: string;
  turnoutTarget: string;
}

export interface MessagingTheme {
  theme: string;
  audience: string;
  channels: string[];
}

export interface ResourceItem {
  area: string;
  recommendation: string;
}

export interface RiskItem {
  risk: string;
  mitigation: string;
}

export interface WardStrategy {
  overview: string;
  targetWards: TargetWard[];
  messagingThemes: MessagingTheme[];
  resourceAllocation: ResourceItem[];
  risks: RiskItem[];
  quickWins: string[];
}

const EMPTY_STRATEGY: WardStrategy = {
  overview: "",
  targetWards: [],
  messagingThemes: [],
  resourceAllocation: [],
  risks: [],
  quickWins: [],
};

/**
 * Builds an AI-generated campaign strategy from ward-election data.
 * Returns a structured WardStrategy. Throws on API errors so callers can
 * surface a clear message; returns a `configured: false` flag when no key.
 */
export async function generateWardStrategy(
  input: StrategyInput
): Promise<{ configured: boolean; strategy: WardStrategy }> {
  if (!process.env.OPENAI_API_KEY) {
    return { configured: false, strategy: EMPTY_STRATEGY };
  }

  // Keep the payload compact and avoid leaking unbounded data into the prompt.
  const wardSummary = input.wards.slice(0, 60).map((w) => ({
    id: w.id,
    name: w.name,
    number: w.number,
    zone: w.zone ?? null,
    electorate: w.electorate ?? null,
    male: w.male ?? null,
    female: w.female ?? null,
    thirdGender: w.thirdGender ?? null,
    partNo: w.partNo ?? null,
    sections: w.sections ?? null,
    pollingStation: w.pollingStation ?? null,
    village: w.village ?? null,
    assemblyConstituency: w.assemblyConstituency ?? null,
  }));

  const candidateSummary = input.candidates.slice(0, 120).map((c) => ({
    name: c.name,
    party: c.party,
    wardId: c.wardId,
    votes: c.votes ?? null,
  }));

  const prompt = `You are a senior election campaign strategist analysing ward-level data for a local body election.

ELECTION CONTEXT:
- Title: ${input.meta.title}
- Body: ${input.meta.body}
- Date: ${input.meta.electionDate}
- Total wards: ${input.meta.totalWards}
- Total electors: ${input.meta.totalElectors}
${input.party ? `- Strategy is being built for: ${input.party}` : ""}
${input.objective ? `- Campaign objective: ${input.objective}` : ""}

WARD DATA (JSON):
${JSON.stringify(wardSummary, null, 2)}

CANDIDATE DATA (JSON):
${JSON.stringify(candidateSummary, null, 2)}

Using ONLY the data above (do not invent specific numbers that are not present; reason qualitatively when data is missing), produce a practical, ethical campaign strategy.

Respond with ONLY a valid JSON object in this exact shape:
{
  "overview": "2-3 sentence situational summary and the core strategic thrust",
  "targetWards": [
    { "wardId": "<id>", "name": "<ward name>", "priority": "high|medium|low", "rationale": "why this ward matters", "turnoutTarget": "a turnout goal or focus" }
  ],
  "messagingThemes": [
    { "theme": "core message", "audience": "who it targets", "channels": ["door-to-door", "social", "..."] }
  ],
  "resourceAllocation": [
    { "area": "volunteers|budget|events|...", "recommendation": "how to allocate" }
  ],
  "risks": [
    { "risk": "what could go wrong", "mitigation": "how to address it" }
  ],
  "quickWins": ["short actionable items"]
}

Keep targetWards to at most 8, ordered by priority. Keep all arrays concise and actionable. Do not include any commentary outside the JSON.`;

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_tokens: 1500,
  });

  const parsed = JSON.parse(
    response.choices[0]?.message?.content ?? "{}"
  ) as Partial<WardStrategy>;

  return {
    configured: true,
    strategy: {
      overview: parsed.overview ?? "",
      targetWards: parsed.targetWards ?? [],
      messagingThemes: parsed.messagingThemes ?? [],
      resourceAllocation: parsed.resourceAllocation ?? [],
      risks: parsed.risks ?? [],
      quickWins: parsed.quickWins ?? [],
    },
  };
}
