import OpenAI from "openai";
import type { Ward, Candidate, ElectionMeta } from "@/lib/ward-election-data";
import { getAnalyticsByWard, ANALYTICS_META } from "@/lib/ward-election-analytics";
import { buildWardElectionSystemPrompt } from "@/lib/ward-election-context";
import {
  WARD_CHAT_TOOLS,
  runWardElectionTool,
} from "@/lib/ward-election-chat-tools";
import {
  extractPartFromMessage,
  extractVoterSearchQuery,
} from "@/lib/ward-voter-search";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

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
  // Enrich each ward with demographic cohorts from the voter-level analytics.
  const wardSummary = input.wards.slice(0, 60).map((w) => {
    const a = w.partNo != null ? getAnalyticsByWard(w.partNo, w.areaId) : undefined;
    const ageKnown = a
      ? a.ageBands.y18_29 + a.ageBands.a30_44 + a.ageBands.a45_59 + a.ageBands.a60plus + a.ageBands.u18
      : 0;
    const pct = (n: number) => (ageKnown ? Math.round((n / ageKnown) * 100) : null);
    return {
      id: w.id,
      name: w.name,
      number: w.number,
      electorate: w.electorate ?? null,
      male: w.male ?? null,
      female: w.female ?? null,
      partNo: w.partNo ?? null,
      sections: w.sections ?? null,
      pollingStation: w.pollingStation ?? null,
      demographics: a
        ? {
            analyzedVoters: a.analyzedVoters,
            avgAge: a.avgAge,
            households: a.households,
            youthPct18_29: pct(a.ageBands.y18_29),
            midPct30_44: pct(a.ageBands.a30_44),
            seniorPct60plus: pct(a.ageBands.a60plus),
            femaleShareKnown:
              a.male + a.female > 0 ? Math.round((a.female / (a.male + a.female)) * 100) : null,
          }
        : null,
    };
  });

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

WARD DATA (JSON) — "electorate"/"male"/"female" are official roll totals; "demographics" are
derived from an analyzed voter-level sample (${ANALYTICS_META.totalAnalyzed} records, partial — may
under-represent each ward), giving age cohorts, female share and household counts:
${JSON.stringify(wardSummary, null, 2)}

CANDIDATE DATA (JSON):
${JSON.stringify(candidateSummary, null, 2)}

Using ONLY the data above (do not invent specific numbers that are not present; reason qualitatively when data is missing), produce a practical, ethical campaign strategy. Use the demographic cohorts (youth vs senior share, female share, households per ward) to tailor messaging, GOTV and door-to-door canvassing. Prioritise larger wards and those with distinctive cohorts.

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

export interface WardChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface WardChatInput {
  messages: WardChatMessage[];
  /** Focus context: one area, or both. */
  areaFocus?: "veppampattu" | "perumalpattu" | "all";
}

export type WardChatStreamEvent =
  | { type: "status"; message: string }
  | { type: "token"; text: string }
  | { type: "done"; reply: string; toolsUsed: string[] }
  | { type: "error"; message: string };

const MAX_HISTORY = 24;
const MAX_TOOL_ROUNDS = 8;

const TOOL_LABELS: Record<string, string> = {
  list_election_areas: "Listed election areas",
  list_ward_parts: "Loaded ward parts",
  get_ward_details: "Fetched ward details",
  search_voters: "Searched voter JSON",
  aggregate_voters: "Aggregated voter data",
  list_households: "Listed households",
};

type ChatMessage = ChatCompletionMessageParam;

function toolStatusLabel(name: string): string {
  return TOOL_LABELS[name] ?? `Query: ${name}`;
}

/** Run voter search before the LLM when the user message looks like a name lookup. */
function appendVoterSearchPrefetch(
  messages: ChatMessage[],
  userText: string,
  areaFocus: "veppampattu" | "perumalpattu" | "all"
): void {
  const query = extractVoterSearchQuery(userText);
  if (!query) return;

  const partNo = extractPartFromMessage(userText);
  const result = runWardElectionTool(
    "search_voters",
    {
      query,
      areaId: areaFocus === "all" ? "all" : areaFocus,
      ...(partNo != null ? { partNo } : {}),
      limit: 30,
    },
    areaFocus
  );

  messages.push({
    role: "system",
    content:
      `AUTO_VOTER_SEARCH (already ran search_voters for "${query}"` +
      (partNo != null ? ` in Part ${partNo}` : "") +
      ` — use these rows in your answer; cite part, house, voter ID):\n` +
      JSON.stringify(result),
  });
}

/** Agent loop with OpenAI tools over voter JSON + ward data. */
export async function chatWardElection(
  input: WardChatInput
): Promise<{ configured: boolean; reply: string; toolsUsed: string[] }> {
  if (!process.env.OPENAI_API_KEY) {
    return { configured: false, reply: "", toolsUsed: [] };
  }

  const focus = input.areaFocus ?? "all";
  const system = buildWardElectionSystemPrompt(focus);
  const history = input.messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  if (history.length === 0 || history[history.length - 1].role !== "user") {
    throw new Error("Last message must be from the user");
  }

  const messages: ChatMessage[] = [{ role: "system", content: system }, ...history];
  const lastUserText = history[history.length - 1]?.content ?? "";
  appendVoterSearchPrefetch(messages, lastUserText, focus);
  const toolsUsed: string[] = [];
  if (extractVoterSearchQuery(lastUserText)) {
    toolsUsed.push(TOOL_LABELS.search_voters);
  }
  const client = getClient();

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: WARD_CHAT_TOOLS,
      tool_choice: "auto",
      temperature: 0.35,
      max_tokens: 1600,
    });

    const choice = response.choices[0]?.message;
    if (!choice) break;

    const toolCalls = choice.tool_calls;
    if (!toolCalls?.length) {
      const reply = choice.content?.trim() ?? "";
      return { configured: true, reply, toolsUsed };
    }

    messages.push(choice);

    for (const tc of toolCalls) {
      if (tc.type !== "function") continue;
      const fn = tc.function;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(fn.arguments || "{}") as Record<string, unknown>;
      } catch {
        args = {};
      }
      toolsUsed.push(toolStatusLabel(fn.name));
      const result = runWardElectionTool(fn.name, args, focus);
      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }
  }

  return {
    configured: true,
    reply: "I could not finish looking up the data. Please try a simpler question or specify the part number and area.",
    toolsUsed,
  };
}

/** Stream status + final reply tokens for interactive UI. */
export async function* chatWardElectionStream(
  input: WardChatInput
): AsyncGenerator<WardChatStreamEvent> {
  if (!process.env.OPENAI_API_KEY) {
    yield { type: "error", message: "OPENAI_API_KEY not configured" };
    return;
  }

  const focus = input.areaFocus ?? "all";
  const system = buildWardElectionSystemPrompt(focus);
  const history = input.messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  if (history.length === 0 || history[history.length - 1].role !== "user") {
    yield { type: "error", message: "Last message must be from the user" };
    return;
  }

  const messages: ChatMessage[] = [{ role: "system", content: system }, ...history];
  const lastUserText = history[history.length - 1]?.content ?? "";
  appendVoterSearchPrefetch(messages, lastUserText, focus);
  const toolsUsed: string[] = [];
  const autoSearch = extractVoterSearchQuery(lastUserText);
  if (autoSearch) {
    toolsUsed.push(TOOL_LABELS.search_voters);
    yield { type: "status", message: "Searched voter JSON…" };
  }
  const client = getClient();

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: WARD_CHAT_TOOLS,
      tool_choice: "auto",
      temperature: 0.35,
      max_tokens: 1600,
    });

    const choice = response.choices[0]?.message;
    if (!choice) break;

    const toolCalls = choice.tool_calls;
    if (!toolCalls?.length) {
      const full = choice.content?.trim() ?? "";
      const words = full.split(/(\s+)/);
      let buf = "";
      for (const w of words) {
        buf += w;
        if (buf.length >= 12) {
          yield { type: "token", text: buf };
          buf = "";
          await new Promise((r) => setTimeout(r, 8));
        }
      }
      if (buf) yield { type: "token", text: buf };
      yield { type: "done", reply: full, toolsUsed };
      return;
    }

    messages.push(choice);

    for (const tc of toolCalls) {
      if (tc.type !== "function") continue;
      const fn = tc.function;
      const label = toolStatusLabel(fn.name);
      toolsUsed.push(label);
      yield { type: "status", message: label + "…" };

      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(fn.arguments || "{}") as Record<string, unknown>;
      } catch {
        args = {};
      }
      const result = runWardElectionTool(fn.name, args, focus);
      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }
  }

  yield {
    type: "done",
    reply: "I could not complete the lookup. Try naming the part number and area (Veppampattu or Perumalpattu).",
    toolsUsed,
  };
}
