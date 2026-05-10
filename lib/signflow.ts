/**
 * SignFlow integration — native e-signature envelopes
 * Base URL: https://signflow-drab.vercel.app
 * API docs: https://signflow-drab.vercel.app/api/docs/openapi
 *
 * Set SIGNFLOW_API_KEY in .env  (format: sfk_…)
 *
 * Signature position uses normalised coords (0–1):
 *   x: left  → right  (0 = left edge, 1 = right edge)
 *   y: top   → bottom (0 = top edge,  1 = bottom edge)
 */

const SIGNFLOW_API = "https://signflow-drab.vercel.app/api/v1/envelopes";

export interface SignFlowSigner {
  email:         string;
  name:          string;
  routingOrder?: number;
}

/** Normalised (0–1) signature field position on the PDF page */
export interface SignaturePosition {
  x:          number;   // 0–1, left→right
  y:          number;   // 0–1, top→bottom
  pageIndex?: number;   // 0-based page number (default 0)
  width?:     number;   // default 0.35
  height?:    number;   // default 0.06
}

export interface SignFlowEnvelopeInput {
  title:               string;
  documentPdfBase64:   string;
  signers:             SignFlowSigner[];
  /** One entry per signer — signerIndex matches signers[] array position */
  signaturePositions?: SignaturePosition[];
  send?:               boolean;
}

export interface SignFlowResult {
  envelopeId:      string;
  status:          string;
  inviteLinks?:    { email: string; link: string }[];
  gmailConfigured: boolean;
  emailResults?:   unknown;
  rawResponse?:    unknown;
}

/* ── Normalise whatever SignFlow returns into { email, link }[] ── */
function extractInviteLinks(json: Record<string, unknown>): { email: string; link: string }[] {
  if (Array.isArray(json.inviteLinks)) {
    return (json.inviteLinks as { email?: string; link?: string }[])
      .filter(x => x.link)
      .map(x => ({ email: x.email ?? "", link: x.link! }));
  }
  if (Array.isArray(json.signers)) {
    return (json.signers as { email?: string; signingUrl?: string; signing_url?: string; link?: string }[])
      .filter(x => x.signingUrl ?? x.signing_url ?? x.link)
      .map(x => ({ email: x.email ?? "", link: (x.signingUrl ?? x.signing_url ?? x.link)! }));
  }
  const recipients =
    (json.recipients ?? json.envelopeSigners) as
    { email?: string; signingUrl?: string; link?: string }[] | undefined;
  if (Array.isArray(recipients)) {
    return recipients
      .filter(x => x.signingUrl ?? x.link)
      .map(x => ({ email: x.email ?? "", link: (x.signingUrl ?? x.link)! }));
  }
  return [];
}

export async function createSignFlowEnvelope(
  input: SignFlowEnvelopeInput
): Promise<SignFlowResult | null> {
  const apiKey = process.env.SIGNFLOW_API_KEY;
  if (!apiKey) {
    console.warn("[signflow] SIGNFLOW_API_KEY not set — skipping");
    return null;
  }

  /* Build the fields array — one signature field per signer */
  const fields = (input.signaturePositions ?? []).map((pos, i) => ({
    type:        "signature",
    signerIndex: i,
    pageIndex:   pos.pageIndex ?? 0,
    x:           pos.x,
    y:           pos.y,
    width:       pos.width  ?? 0.35,
    height:      pos.height ?? 0.06,
  }));

  const body = JSON.stringify({
    title:             input.title,
    documentPdfBase64: input.documentPdfBase64,
    signers:           input.signers,
    send:              input.send ?? true,
    ...(fields.length > 0 ? { fields } : {}),
  });

  console.log(
    "[signflow] POST", SIGNFLOW_API,
    "| signers:", input.signers.map(s => s.email).join(", "),
    "| fields:", fields.length,
    fields.map(f => `signer${f.signerIndex}@(${f.x.toFixed(2)},${f.y.toFixed(2)})`).join(" "),
  );

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 20_000);

    const res = await fetch(SIGNFLOW_API, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body,
      signal:  controller.signal,
    });
    clearTimeout(tid);

    const rawText = await res.text();
    console.log("[signflow] status:", res.status, "| body:", rawText.slice(0, 600));

    let json: Record<string, unknown> = {};
    try { json = JSON.parse(rawText); } catch { /* non-JSON */ }

    if (!res.ok) {
      console.error("[signflow] error", res.status, rawText.slice(0, 300));
      return null;
    }

    const inviteLinks     = extractInviteLinks(json);
    const gmailConfigured =
      typeof json.gmailConfigured === "boolean" ? json.gmailConfigured :
      typeof json.emailSent       === "boolean" ? json.emailSent       :
      inviteLinks.length > 0;

    return {
      envelopeId:      (json.envelopeId ?? json.id ?? json.envelope_id ?? "") as string,
      status:          (json.status ?? "created") as string,
      inviteLinks,
      gmailConfigured,
      emailResults:    json.emailResults,
      rawResponse:     json,
    };
  } catch (err: unknown) {
    const isTimeout = (err as { name?: string }).name === "AbortError";
    console.error(`[signflow] ${isTimeout ? "timed out" : "failed"}:`, err);
    return null;
  }
}
