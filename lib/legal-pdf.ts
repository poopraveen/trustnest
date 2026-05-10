/**
 * Legal PDF generator
 *
 * Strategy:
 *   1. Always build a base PDF from form data using pdfkit (never fails)
 *   2. Optionally call the AI legal-tech API for enriched draft text
 *      — if API is unavailable the base PDF is returned unchanged
 *
 * Base PDF is generated immediately from the grievance form fields,
 * so SignFlow always receives a document even when the AI API is cold/down.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require("pdfkit") as typeof import("pdfkit");

const LEGAL_API_BASE =
  process.env.LEGAL_TECH_API_URL ?? "https://payrollsystem-2w0h.onrender.com";
const LEGAL_API = `${LEGAL_API_BASE}/legal-tech/generate-public`;

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
  construction:             "Tamil Nadu Housing Board / Local Body Engineering Department",
};
const DEFAULT_DEPT = "Tamil Nadu State Government – Concerned Department";

const RELIEF_MAP: Record<string, string> = {
  "roads-&-infrastructure": "Immediate inspection, repair and restoration of road / infrastructure causing public hardship",
  "roads-infrastructure":   "Immediate inspection, repair and restoration of road / infrastructure causing public hardship",
  electricity:              "Restoration of uninterrupted power supply and repair of faulty electrical infrastructure",
  "water-supply":           "Restoration of regular, clean potable water supply to the affected locality",
  "health-services":        "Provision of adequate healthcare personnel, medicines and facilities at the public health centre",
  education:                "Resolution of the educational grievance and provision of quality education as per government norms",
  "social-welfare":         "Release of all entitled social welfare benefits and correction of administrative errors",
  "land-records":           "Rectification of land records and issuance of proper revenue documentation without delay",
  construction:             "Immediate inspection and compliance action on the reported construction irregularity",
};
const DEFAULT_RELIEF =
  "Prompt resolution within the 30-day SLA stipulated by the Tamil Nadu Grievance Redressal Act";

/* ── Input type ──────────────────────────────────────────────── */
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

/* ── Divider helper ──────────────────────────────────────────── */
function divider(doc: InstanceType<typeof PDFDocument>, color = "#d1d5db") {
  doc
    .moveTo(60, doc.y)
    .lineTo(doc.page.width - 60, doc.y)
    .strokeColor(color).lineWidth(0.8).stroke();
  doc.moveDown(0.6);
}

/* ── Build a styled A4 PDF from form data ────────────────────── */
async function buildBasePdf(data: LegalPdfInput, aiDraft?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end",  () => resolve(Buffer.concat(chunks).toString("base64")));
    doc.on("error", reject);

    const dept   = DEPT_MAP[data.category]   ?? DEFAULT_DEPT;
    const relief = RELIEF_MAP[data.category] ?? DEFAULT_RELIEF;
    const location = [data.address, data.locality, data.block, data.district]
      .filter(Boolean).join(", ");
    const filedStr = data.filedAt.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata", year: "numeric", month: "long", day: "numeric",
    });

    /* ── Page header ── */
    doc.rect(0, 0, doc.page.width, 80).fill("#14532d");
    doc.fillColor("#ffffff").fontSize(14).font("Helvetica-Bold")
       .text("GOVERNMENT OF TAMIL NADU", 60, 18, { align: "center" });
    doc.fontSize(10).font("Helvetica")
       .text("Citizen Grievance Portal  ·  TN Vettri", 60, 38, { align: "center" });
    doc.fontSize(9).fillColor("#bbf7d0")
       .text("tamilnadu.gov.in  ·  pgportal.gov.in", 60, 54, { align: "center" });

    doc.fillColor("#111827").moveDown(0.5);
    doc.y = 96;

    /* ── Ticket badge ── */
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#15803d")
       .text(`TICKET NO:  ${data.ticketNo}    ·    FILED ON:  ${filedStr}`, {
         align: "center",
       });
    doc.moveDown(0.5);
    divider(doc, "#15803d");

    /* ── Subject ── */
    doc.fontSize(13).font("Helvetica-Bold").fillColor("#111827")
       .text("GRIEVANCE NOTICE", { align: "center" });
    doc.fontSize(11).font("Helvetica")
       .text(`RE: ${data.title}`, { align: "center" });
    doc.moveDown(0.6);
    divider(doc);

    /* ── Parties ── */
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#6b7280")
       .text("FROM (PETITIONER)");
    doc.moveDown(0.2);
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#111827")
       .text(data.name);
    doc.font("Helvetica").fillColor("#374151");
    if (data.phone) doc.text(`Phone: ${data.phone}`);
    if (data.email) doc.text(`Email: ${data.email}`);
    if (location)   doc.text(`Address: ${location}`);

    doc.moveDown(0.6);
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#6b7280")
       .text("TO (RESPONDENT)");
    doc.moveDown(0.2);
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#111827")
       .text(dept);
    doc.font("Helvetica").fillColor("#374151")
       .text(`District Collectorate, ${data.district} District, Tamil Nadu`);

    doc.moveDown(0.6);
    divider(doc);

    /* ── Category & SLA ── */
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#6b7280").text("CATEGORY");
    doc.moveDown(0.15);
    doc.fontSize(10).font("Helvetica").fillColor("#111827")
       .text(data.category.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()));
    doc.moveDown(0.5);

    /* ── Facts ── */
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#6b7280").text("FACTS OF THE CASE");
    doc.moveDown(0.2);
    doc.fontSize(10).font("Helvetica").fillColor("#111827")
       .text(data.description || data.title, { align: "justify", lineGap: 2 });
    doc.moveDown(0.5);

    /* ── Relief ── */
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#6b7280").text("RELIEF SOUGHT");
    doc.moveDown(0.2);
    doc.fontSize(10).font("Helvetica").fillColor("#111827")
       .text(relief, { align: "justify", lineGap: 2 });
    doc.moveDown(0.8);
    divider(doc);

    /* ── AI draft body (if available) ── */
    if (aiDraft) {
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#6b7280")
         .text("AI-GENERATED LEGAL DRAFT (for reference)");
      doc.moveDown(0.3);
      doc.fontSize(9.5).font("Helvetica").fillColor("#111827")
         .text(aiDraft, { align: "justify", lineGap: 3, paragraphGap: 5 });
      doc.moveDown(0.8);
      divider(doc);
    }

    /* ── Declaration & signature space ── */
    doc.fontSize(10).font("Helvetica").fillColor("#111827")
       .text(
         "I, the undersigned, hereby declare that the facts stated above are true and correct " +
         "to the best of my knowledge and belief, and request the concerned authority to take " +
         "immediate action in accordance with the Tamil Nadu Grievance Redressal Act.",
         { align: "justify", lineGap: 2 }
       );

    doc.moveDown(2);
    doc.fontSize(10).font("Helvetica")
       .text("Petitioner Signature: ___________________________", { align: "left" });
    doc.moveDown(0.5);
    doc.text(`Date: ${filedStr}`, { align: "left" });
    doc.moveDown(0.5);
    doc.text(`Place: ${data.locality}, ${data.district}`, { align: "left" });

    /* ── Footer ── */
    const footerY = doc.page.height - 45;
    doc.y = footerY;
    doc.fontSize(7.5).fillColor("#9ca3af")
       .text(
         `Generated by TN Vettri Citizen Grievance Portal  ·  Ticket: ${data.ticketNo}  ·  ` +
         "This is a computer-generated document.",
         { align: "center" }
       );

    doc.end();
  });
}

/* ── Try AI API for enriched draft text ─────────────────────── */
async function fetchAiDraft(data: LegalPdfInput): Promise<string | null> {
  const apiKey = process.env.LEGAL_TECH_API_TOKEN;
  if (!apiKey) return null;

  const dept   = DEPT_MAP[data.category]   ?? DEFAULT_DEPT;
  const relief = RELIEF_MAP[data.category] ?? DEFAULT_RELIEF;
  const location = [data.address, data.locality, data.block, data.district]
    .filter(Boolean).join(", ");

  const payload = {
    caseType:          "grievance-notice",
    jurisdiction:      `District Collectorate – ${data.district}`,
    petitionerName:    data.name,
    respondentName:    dept,
    factsOfCase:       `Ticket: ${data.ticketNo}. ${data.title}. ${data.description ?? ""}`.trim(),
    reliefSought:      relief,
    additionalDetails: `Location: ${location}. Phone: ${data.phone}. Email: ${data.email || "Not provided"}. Filed: ${data.filedAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}.`,
  };

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 20_000);

    const res = await fetch(LEGAL_API, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body:    JSON.stringify(payload),
      signal:  controller.signal,
    });
    clearTimeout(tid);

    if (!res.ok) {
      console.warn(`[legal-pdf] AI API returned ${res.status} — using base PDF only`);
      return null;
    }

    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/pdf")) return null; // binary, skip

    const json = await res.json() as Record<string, unknown>;
    const text = (json.draft ?? json.text ?? json.content) as string | undefined;
    return typeof text === "string" && text.length > 20 ? text : null;
  } catch (err: unknown) {
    const isTimeout = (err as { name?: string }).name === "AbortError";
    console.warn(`[legal-pdf] AI API ${isTimeout ? "timed out" : "failed"} — using base PDF only`);
    return null;
  }
}

/* ── Main export ─────────────────────────────────────────────── */
export async function generateGrievancePdf(data: LegalPdfInput): Promise<string | null> {
  try {
    /* Always attempt AI draft — but PDF is generated regardless */
    const aiDraft = await fetchAiDraft(data);
    if (aiDraft) {
      console.log("[legal-pdf] AI draft received, embedding in PDF");
    } else {
      console.log("[legal-pdf] No AI draft — generating base PDF from form data");
    }

    const pdfBase64 = await buildBasePdf(data, aiDraft ?? undefined);
    console.log("[legal-pdf] PDF generated, base64 length:", pdfBase64.length);
    return pdfBase64;
  } catch (err) {
    console.error("[legal-pdf] pdfkit build failed:", err);
    return null;
  }
}
