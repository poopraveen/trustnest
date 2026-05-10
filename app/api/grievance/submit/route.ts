import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, buildGrievanceMessage } from "@/lib/telegram";
import { generateGrievancePdf }                       from "@/lib/legal-pdf";
import { createSignFlowEnvelope }                     from "@/lib/signflow";
import { getLocalities, TN_DISTRICTS }                from "@/lib/tn-areas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, phone, email,
      district, block, locality, address,
      category, title, description,
      additionalSigners = [],   // [{ name, email }]
    } = body;

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

    /* Build petitioner name including co-petitioners */
    const allPetitioners = [
      { name, email: email ?? "" },
      ...additionalSigners.filter((s: { name: string; email: string }) => s.name?.trim()),
    ];
    const petitionerNameStr = allPetitioners
      .map((s, i) => `${i + 1}. ${s.name}`)
      .join(", ");

    const pdfInput = {
      ticketNo,
      name:         petitionerNameStr,   // all petitioners listed
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
    }

    /* ── 4. Create SignFlow envelope ──────────────────────────────── */
    let envelopeId: string | null = null;
    let signLinks:  { email: string; link: string }[] = [];
    let emailSent   = false;

    const signersForEnvelope = allPetitioners
      .filter(s => s.email?.trim())
      .map((s, i) => ({ email: s.email, name: s.name, routingOrder: i + 1 }));

    if (pdfBase64 && signersForEnvelope.length > 0) {
      try {
        const envelope = await createSignFlowEnvelope({
          title:             `Grievance Acknowledgment – ${ticketNo}`,
          documentPdfBase64: pdfBase64,
          signers:           signersForEnvelope,
          send:              true,
        });
        if (envelope) {
          envelopeId = envelope.envelopeId;
          emailSent  = envelope.gmailConfigured;
          signLinks  = envelope.inviteLinks ?? [];
          console.log("[grievance/submit] SignFlow ok | id:", envelopeId,
            "| links:", signLinks.length, "| gmailConfigured:", emailSent,
            "| raw:", JSON.stringify(envelope.rawResponse).slice(0, 400));
        } else {
          console.warn("[grievance/submit] SignFlow returned null (check SIGNFLOW_API_KEY and logs above)");
        }
      } catch (sfErr) {
        console.error("[grievance/submit] SignFlow failed:", sfErr);
      }
    }

    /* ── 5. Telegram notification ─────────────────────────────────── */
    const telegramMsg = buildGrievanceMessage({
      ticketNo,
      name,
      phone,
      email:        email ?? "",
      district:     districtName,
      block:        blockName,
      locality:     localityName,
      localityType,
      address:      address ?? "",
      category,
      title,
      description:  description ?? "",
      filedAt,
    });
    await sendTelegramMessage({ text: telegramMsg }).catch(err =>
      console.error("[grievance/submit] Telegram failed:", err)
    );

    /* ── 6. Respond ───────────────────────────────────────────────── */
    return NextResponse.json({
      ticketNo,
      filedAt:      filedAt.toISOString(),
      pdfGenerated: pdfBase64 !== null,
      pdfBase64,          // ← client uses this for viewer + download
      envelopeId,
      signLinks,          // [{ email, link }] per signer
      emailSent,
    });

  } catch (err) {
    console.error("[grievance/submit]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
