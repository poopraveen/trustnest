import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, buildGrievanceMessage } from "@/lib/telegram";
import { generateGrievancePdf }                       from "@/lib/legal-pdf";
import { createSignFlowEnvelope }                     from "@/lib/signflow";
import { getLocalities, TN_DISTRICTS }                from "@/lib/tn-areas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, district, block, locality, address, category, title, description } = body;

    /* ── 1. Validate required fields ─────────────────────────────── */
    if (!name || !phone || !district || !block || !locality || !category || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ticketNo = "TN" + Date.now().toString().slice(-8);
    const filedAt  = new Date();

    /* ── 2. Resolve IDs → display names ──────────────────────────── */
    const localities   = getLocalities(district, block);
    const localityObj  = localities.find(l => l.id === locality);
    const localityName = localityObj?.name ?? locality;
    const localityType = localityObj?.type ?? "VP";

    const districtObj  = TN_DISTRICTS.find(d => d.id === district);
    const blockObj     = districtObj?.blocks.find(b => b.id === block);
    const districtName = districtObj?.name ?? district;
    const blockName    = blockObj?.name    ?? block;

    const pdfInput = {
      ticketNo,
      name,
      phone,
      email:        email  ?? "",
      district:     districtName,
      block:        blockName,
      locality:     localityName,
      localityType,
      address:      address     ?? "",
      category,
      title,
      description:  description ?? "",
      filedAt,
    };

    /* ── 3. Generate legal PDF ────────────────────────────────────── */
    let pdfBase64: string | null = null;
    try {
      pdfBase64 = await generateGrievancePdf(pdfInput);
    } catch (pdfErr) {
      console.error("[grievance/submit] PDF generation failed:", pdfErr);
      // non-fatal — continue without PDF
    }

    /* ── 4. Create SignFlow envelope (only if we have a PDF + email) ─ */
    let envelopeId:  string | null = null;
    let signLink:    string | null = null;
    let emailSent:   boolean       = false;

    if (pdfBase64 && email) {
      try {
        const envelope = await createSignFlowEnvelope({
          title:             `Grievance Acknowledgment – ${ticketNo}`,
          documentPdfBase64: pdfBase64,
          signers: [{ email, name, routingOrder: 1 }],
          send:    true,
        });

        if (envelope) {
          envelopeId = envelope.envelopeId;
          emailSent  = envelope.gmailConfigured;
          // Pick the signer's own invite link for direct access
          signLink   = envelope.inviteLinks?.find(l => l.email === email)?.link
                    ?? envelope.inviteLinks?.[0]?.link
                    ?? null;
        }
      } catch (sfErr) {
        console.error("[grievance/submit] SignFlow failed:", sfErr);
        // non-fatal
      }
    }

    /* ── 5. Telegram notification ─────────────────────────────────── */
    const telegramMsg = buildGrievanceMessage({
      ...pdfInput,
      localityType,
    });
    await sendTelegramMessage({ text: telegramMsg }).catch(err =>
      console.error("[grievance/submit] Telegram failed:", err)
    );

    /* ── 6. Respond to client ─────────────────────────────────────── */
    return NextResponse.json({
      ticketNo,
      filedAt:    filedAt.toISOString(),
      pdfGenerated: pdfBase64 !== null,
      envelopeId,
      signLink,
      emailSent,
    });

  } catch (err) {
    console.error("[grievance/submit]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
