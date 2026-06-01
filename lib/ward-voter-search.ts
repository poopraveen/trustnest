/** Voter name / ID search helpers (client-safe matching + chat query parsing). */

import type { VoterRecord } from "@/lib/ward-voters";

export function normalizeSearchText(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/[.|,;|'"()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function voterSearchText(v: VoterRecord): string {
  return normalizeSearchText(
    [v.name, v.relativeType, v.relativeName, v.voterId, v.houseNumber].filter(Boolean).join(" ")
  );
}

/** Match full query or all tokens (min 2 chars each). */
export function matchesVoterSearch(v: VoterRecord, rawQuery: string): boolean {
  const q = normalizeSearchText(rawQuery);
  if (!q) return false;
  const hay = voterSearchText(v);
  if (hay.includes(q)) return true;

  const tokens = q.split(/\s+/).filter((t) => t.length >= 2);
  if (tokens.length === 0) return hay.includes(q);
  return tokens.every((t) => hay.includes(t));
}

export function cleanVoterSearchQuery(raw: string): string {
  return raw
    .replace(/\s+in\s+part\s+\d+/gi, "")
    .replace(/\s+part\s+\d+/gi, "")
    .replace(/\s+(veppampattu|perumalpattu|வேப்பம்பட்டு|பெருமாள்பட்டு)/gi, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

/** Pull a voter name/ID search string from a natural-language chat message. */
export function extractVoterSearchQuery(message: string): string | null {
  const m = message.trim();
  if (!m) return null;

  const patterns: RegExp[] = [
    /(?:search|find|look\s*up|lookup)\s+(?:the\s+)?(?:voter\s+)?(?:json\s+)?(?:for\s+)?(?:name\s+)?["']?(.+?)["']?(?:\s+in\s+|\?|$)/i,
    /(?:who\s+is|where\s+is|details?\s+for)\s+["']?(.+?)["']?(?:\?|$)/i,
    /(?:voter\s+)?(?:named?|called)\s+["']?([^"']+)["']?/i,
    /(?:name|voter\s+id)\s*[:=]\s*["']?([^"']+)["']?/i,
  ];

  for (const re of patterns) {
    const match = m.match(re);
    if (match?.[1]) {
      const q = cleanVoterSearchQuery(match[1]);
      if (q.length >= 2) return q;
    }
  }

  if (isBareNameQuery(m)) return m.trim();

  return null;
}

export function isBareNameQuery(msg: string): boolean {
  const t = msg.trim();
  if (t.length < 2 || t.length > 80) return false;
  if (
    /how many|how much|list all|compare|total|aggregate|strategy|household|turnout|elector|ward parts?|parts?\s+\d{3}/i.test(
      t
    )
  ) {
    return false;
  }
  if (/^[a-zA-Z0-9.\s'-]+$/.test(t) && t.split(/\s+/).length <= 5) return true;
  return false;
}

export function extractPartFromMessage(message: string): number | undefined {
  const m = message.match(/\bpart\s*(\d{3})\b/i) ?? message.match(/\b(?:ward|polling)\s*(\d{3})\b/i);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isNaN(n) ? undefined : n;
}
