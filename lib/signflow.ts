/**
 * SignFlow integration — native e-signature envelopes
 * Base URL: https://signflow-drab.vercel.app
 * Docs:     https://signflow-drab.vercel.app/api/docs/openapi
 *
 * Set SIGNFLOW_API_KEY in .env  (format: sfk_…)
 */

const SIGNFLOW_API = "https://signflow-drab.vercel.app/api/v1/envelopes";

export interface SignFlowSigner {
  email:         string;
  name:          string;
  routingOrder?: number;
}

export interface SignFlowEnvelopeInput {
  title:               string;
  documentPdfBase64:   string;   // raw base64, no "data:" prefix
  signers:             SignFlowSigner[];
  send?:               boolean;  // default true — sends email invite
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
  /* Shape 1 — inviteLinks: [{ email, link }] */
  if (Array.isArray(json.inviteLinks)) {
    return (json.inviteLinks as { email?: string; link?: string }[])
      .filter(x => x.link)
      .map(x => ({ email: x.email ?? "", link: x.link! }));
  }

  /* Shape 2 — signers: [{ email, signingUrl }] */
  if (Array.isArray(json.signers)) {
    return (json.signers as { email?: string; signingUrl?: string; signing_url?: string; link?: string }[])
      .filter(x => x.signingUrl ?? x.signing_url ?? x.link)
      .map(x => ({
        email: x.email ?? "",
        link:  (x.signingUrl ?? x.signing_url ?? x.link)!,
      }));
  }

  /* Shape 3 — recipients / envelopeSigners */
  const recipients =
    (json.recipients ?? json.envelopeSigners ?? json.recipients_data) as
    { email?: string; signingUrl?: string; signing_url?: string; link?: string }[] | undefined;
  if (Array.isArray(recipients)) {
    return recipients
      .filter(x => x.signingUrl ?? x.signing_url ?? x.link)
      .map(x => ({
        email: x.email ?? "",
        link:  (x.signingUrl ?? x.signing_url ?? x.link)!,
      }));
  }

  return [];
}

export async function createSignFlowEnvelope(
  input: SignFlowEnvelopeInput
): Promise<SignFlowResult | null> {
  const apiKey = process.env.SIGNFLOW_API_KEY;
  if (!apiKey) {
    console.warn("[signflow] SIGNFLOW_API_KEY not set — skipping envelope creation");
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 20_000); // 20 s max

    const body = JSON.stringify({
      title:               input.title,
      documentPdfBase64:   input.documentPdfBase64,
      signers:             input.signers,
      send:                input.send ?? true,
    });

    console.log("[signflow] Sending envelope to", SIGNFLOW_API,
      "| signers:", input.signers.map(s => s.email).join(", "),
      "| pdfLen:", input.documentPdfBase64.length);

    const res = await fetch(SIGNFLOW_API, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key":    apiKey,
      },
      body,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const rawText = await res.text();
    console.log("[signflow] Status:", res.status, "| Body:", rawText.slice(0, 500));

    let json: Record<string, unknown> = {};
    try { json = JSON.parse(rawText); } catch { /* non-JSON response */ }

    if (!res.ok) {
      console.error("[signflow] API error", res.status, rawText.slice(0, 300));
      return null;
    }

    const inviteLinks  = extractInviteLinks(json);
    const gmailConfigured =
      typeof json.gmailConfigured === "boolean" ? json.gmailConfigured :
      typeof json.emailSent       === "boolean" ? json.emailSent       :
      inviteLinks.length > 0;

    return {
      envelopeId:      (json.envelopeId ?? json.id ?? json.envelope_id ?? "") as string,
      status:          (json.status ?? "created") as string,
      inviteLinks,
      gmailConfigured,
      emailResults:    json.emailResults ?? json.email_results,
      rawResponse:     json,
    };
  } catch (err: unknown) {
    if ((err as { name?: string }).name === "AbortError") {
      console.error("[signflow] Request timed out after 20 s");
    } else {
      console.error("[signflow] fetch failed:", err);
    }
    return null;
  }
}
