/**
 * Legal PDF generator — calls the external legal-tech API
 * POST https://payrollsystem-2w0h.onrender.com/legal-tech/generate
 *
 * Maps grievance form data → legal notice request body
 * Returns: base64 PDF string ready for SignFlow
 */

const LEGAL_API = "https://payrollsystem-2w0h.onrender.com/legal-tech/generate";

/* ── Category → Respondent Department ───────────────────────── */
const DEPT_MAP: Record<string, string> = {
  "roads-&-infrastructure": "Tamil Nadu Highways Department",
  "roads-infrastructure":   "Tamil Nadu Highways Department",
  electricity:              "Tamil Nadu Generation and Distribution Corporation (TANGEDCO)",
  "water-supply":           "Tamil Nadu Water Supply and Drainage Board (TWAD)",
  "health-services":        "Tamil Nadu Health and Family Welfare Department",
  education:                "Tamil Nadu School Education Department",
  "social-welfare":         "Tamil Nadu Social Welfare and Women Empowerment Department",
  "land-records":           "Tamil Nadu Revenue and Disaster Management Department",
};

const DEFAULT_DEPT = "Tamil Nadu State Government – Concerned Department";

/* ── Category → Relief Sought ────────────────────────────────── */
const RELIEF_MAP: Record<string, string> = {
  "roads-&-infrastructure": "Immediate inspection, repair and restoration of road infrastructure causing public hardship",
  "roads-infrastructure":   "Immediate inspection, repair and restoration of road infrastructure causing public hardship",
  electricity:              "Restoration of uninterrupted power supply and repair of faulty electrical infrastructure",
  "water-supply":           "Restoration of regular, clean potable water supply to the affected locality",
  "health-services":        "Provision of adequate healthcare personnel, medicines and facilities at the public health centre",
  education:                "Resolution of the educational grievance and provision of quality education as per government norms",
  "social-welfare":         "Release of all entitled social welfare benefits and correction of any administrative errors",
  "land-records":           "Rectification of land records and issuance of proper revenue documentation without delay",
};

const DEFAULT_RELIEF = "Prompt resolution of the grievance within the 30-day SLA stipulated by the Tamil Nadu Grievance Redressal Act";

/* ── Main function ───────────────────────────────────────────── */
export interface LegalPdfInput {
  ticketNo:     string;
  name:         string;
  phone:        string;
  email:        string;
  district:     string;
  block:        string;
  locality:     string;
  localityType: string;
  address:      string;
  category:     string;
  title:        string;
  description:  string;
  filedAt:      Date;
}

export async function generateGrievancePdf(data: LegalPdfInput): Promise<string | null> {
  const dept    = DEPT_MAP[data.category]   ?? DEFAULT_DEPT;
  const relief  = RELIEF_MAP[data.category] ?? DEFAULT_RELIEF;

  const location = [data.locality, data.block, data.district, data.address]
    .filter(Boolean).join(", ");

  const payload = {
    caseType:          "grievance-notice",
    jurisdiction:      `District Collectorate – ${data.district}`,
    petitionerName:    `1. ${data.name}`,
    respondentName:    `1. ${dept}`,
    factsOfCase:       `Ticket: ${data.ticketNo}. ${data.title}. ${data.description ?? ""}`.trim(),
    reliefSought:      relief,
    additionalDetails: `Location: ${location}. Phone: ${data.phone}. Email: ${data.email || "Not provided"}. Filed: ${data.filedAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}.`,
  };

  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 25_000); // 25 s max

    const res = await fetch(LEGAL_API, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
      signal:  controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error("[legal-pdf] API error", res.status, await res.text());
      return null;
    }

    const ct = res.headers.get("content-type") ?? "";

    /* Case 1 — API returns raw PDF bytes */
    if (ct.includes("application/pdf")) {
      const buf = await res.arrayBuffer();
      return Buffer.from(buf).toString("base64");
    }

    /* Case 2 — API returns JSON containing base64 PDF */
    const json = await res.json();
    const b64 = json.pdf ?? json.pdfBase64 ?? json.base64 ?? json.data ?? null;
    if (typeof b64 === "string") {
      /* Strip data-URI prefix if present */
      return b64.replace(/^data:[^;]+;base64,/, "");
    }

    console.error("[legal-pdf] Unrecognised response shape:", JSON.stringify(json).slice(0, 200));
    return null;
  } catch (err) {
    console.error("[legal-pdf] fetch failed:", err);
    return null;
  }
}
