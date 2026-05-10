/**
 * SignFlow integration — native e-signature envelopes (no DocuSign required)
 * Base URL: https://signflow-drab.vercel.app
 * Docs:     https://signflow-drab.vercel.app/api/docs/openapi
 *
 * Set SIGNFLOW_API_KEY in .env  (format: sfk_…)
 */

const SIGNFLOW_API = "https://signflow-drab.vercel.app/api/v1/envelopes";

export interface SignFlowSigner {
  email:        string;
  name:         string;
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
    const timeoutId  = setTimeout(() => controller.abort(), 15_000); // 15 s max

    const res = await fetch(SIGNFLOW_API, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key":    apiKey,
      },
      body: JSON.stringify({
        title:               input.title,
        documentPdfBase64:   input.documentPdfBase64,
        signers:             input.signers,
        send:                input.send ?? true,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json = await res.json();

    if (!res.ok) {
      console.error("[signflow] API error", res.status, json);
      return null;
    }

    return {
      envelopeId:      json.envelopeId,
      status:          json.status,
      inviteLinks:     json.inviteLinks,
      gmailConfigured: json.gmailConfigured ?? false,
      emailResults:    json.emailResults,
    };
  } catch (err) {
    console.error("[signflow] fetch failed:", err);
    return null;
  }
}
