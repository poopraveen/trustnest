/**
 * Legal PDF generator — calls the public legal-tech API endpoint,
 * then converts the returned draft text into a formatted PDF via pdfkit.
 *
 * API: POST /legal-tech/generate-public  (x-api-key authenticated)
 * Returns: base64-encoded PDF string ready for SignFlow
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require("pdfkit") as typeof import("pdfkit");

const LEGAL_API =
  (process.env.LEGAL_TECH_API_URL ??
    "https://payrollsystem-2w0h.onrender.com") + "/legal-tech/generate-public";

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
const DEFAULT_RELIEF =
  "Prompt resolution of the grievance within the 30-day SLA stipulated by the Tamil Nadu Grievance Redressal Act";

/* ── Input type ──────────────────────────────────────────────── */
export interface LegalPdfInput {
  ticketNo:     string;
  name:         string;   // may include co-petitioners, e.g. "1. Alice, 2. Bob"
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

/* ── Text → PDF (pdfkit) ─────────────────────────────────────── */
function buildPdfBase64(draftText: string, data: LegalPdfInput): Promise<string> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 72, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end",  () => resolve(Buffer.concat(chunks).toString("base64")));
    doc.on("error", reject);

    /* ── Header ── */
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("GOVERNMENT OF TAMIL NADU", { align: "center" });
    doc
      .fontSize(11)
      .font("Helvetica")
      .text("Citizen Grievance Portal — TN Vettri", { align: "center" });

    doc.moveDown(0.4);
    doc
      .moveTo(72, doc.y)
      .lineTo(doc.page.width - 72, doc.y)
      .strokeColor("#15803d")
      .lineWidth(1.5)
      .stroke();
    doc.moveDown(0.6);

    /* ── Metadata block ── */
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text(`Ticket No:`, { continued: true }).font("Helvetica").text(`  ${data.ticketNo}`);
    doc.font("Helvetica-Bold").text(`Filed On: `, { continued: true }).font("Helvetica")
       .text(data.filedAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", year: "numeric", month: "long", day: "numeric" }));
    doc.font("Helvetica-Bold").text(`Category: `, { continued: true }).font("Helvetica")
       .text(data.category);

    doc.moveDown(0.5);
    doc
      .moveTo(72, doc.y)
      .lineTo(doc.page.width - 72, doc.y)
      .strokeColor("#d1d5db")
      .lineWidth(0.8)
      .stroke();
    doc.moveDown(0.6);

    /* ── Petitioner section ── */
    doc.fontSize(10).font("Helvetica-Bold").text("PETITIONER DETAILS");
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(10);
    doc.text(`Name:     ${data.name}`);
    doc.text(`Phone:    ${data.phone}`);
    if (data.email) doc.text(`Email:    ${data.email}`);
    doc.text(`Address:  ${[data.address, data.locality, data.block, data.district].filter(Boolean).join(", ")}`);

    doc.moveDown(0.8);
    doc
      .moveTo(72, doc.y)
      .lineTo(doc.page.width - 72, doc.y)
      .strokeColor("#d1d5db")
      .lineWidth(0.8)
      .stroke();
    doc.moveDown(0.6);

    /* ── AI-generated draft body ── */
    doc.fontSize(10).font("Helvetica-Bold").text("LEGAL NOTICE / PETITION DRAFT");
    doc.moveDown(0.4);

    /* Render the draft text — wrap long lines */
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(draftText, {
        align:     "justify",
        lineGap:   3,
        paragraphGap: 6,
      });

    doc.moveDown(1.5);

    /* ── Footer ── */
    doc
      .fontSize(9)
      .fillColor("#6b7280")
      .text(
        "This document was generated by the TN Vettri Citizen Grievance Portal. " +
        "It is intended as a legal draft and may require review by a qualified advocate.",
        { align: "center" }
      );

    doc.end();
  });
}

/* ── Main export ─────────────────────────────────────────────── */
export async function generateGrievancePdf(data: LegalPdfInput): Promise<string | null> {
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
    /* ── 1. Call public API ── */
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 25_000);

    const apiKey = process.env.LEGAL_TECH_API_TOKEN; // used as x-api-key for public endpoint
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) headers["x-api-key"] = apiKey;

    const res = await fetch(LEGAL_API, {
      method:  "POST",
      headers,
      body:    JSON.stringify(payload),
      signal:  controller.signal,
    });
    clearTimeout(tid);

    if (!res.ok) {
      const errText = await res.text().catch(() => "(no body)");
      console.error(`[legal-pdf] API error ${res.status}:`, errText.slice(0, 300));
      return null;
    }

    const ct = res.headers.get("content-type") ?? "";

    /* Case A — API already returns a raw PDF binary */
    if (ct.includes("application/pdf")) {
      const buf = await res.arrayBuffer();
      return Buffer.from(buf).toString("base64");
    }

    /* Case B — JSON response */
    const json = await res.json() as Record<string, unknown>;

    /* Case B1 — JSON already has a base64 PDF field */
    const existingB64 =
      (json.pdf ?? json.pdfBase64 ?? json.base64 ?? json.data) as string | undefined;
    if (typeof existingB64 === "string" && existingB64.length > 100) {
      return existingB64.replace(/^data:[^;]+;base64,/, "");
    }

    /* Case B2 — JSON has a draft text field → convert to PDF via pdfkit */
    const draftText = (json.draft ?? json.text ?? json.content) as string | undefined;
    if (typeof draftText === "string" && draftText.length > 10) {
      return await buildPdfBase64(draftText, data);
    }

    console.error("[legal-pdf] Unrecognised response:", JSON.stringify(json).slice(0, 200));
    return null;
  } catch (err: unknown) {
    if ((err as { name?: string }).name === "AbortError") {
      console.error("[legal-pdf] Request timed out after 25 s");
    } else {
      console.error("[legal-pdf] fetch failed:", err);
    }
    return null;
  }
}
