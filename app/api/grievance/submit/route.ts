import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, buildGrievanceMessage } from "@/lib/telegram";
import { generateGrievancePdf }                       from "@/lib/legal-pdf";
import { createSignFlowEnvelope }                     from "@/lib/signflow";
import { sendSigningInvite }                          from "@/lib/mailer";
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
    let signaturePositions: import("@/lib/signflow").SignaturePosition[] = [];

    try {
      const pdfResult = await generateGrievancePdf(pdfInput, allPetitioners.length);
      if (pdfResult) {
        pdfBase64          = pdfResult.base64;
        signaturePositions = pdfResult.signaturePositions;
      }
    } catch (pdfErr) {
      console.error("[grievance/submit] PDF generation failed:", pdfErr);
    }

    /* ── 4. Create SignFlow envelope ──────────────────────────────── */
    let envelopeId:    string | null = null;
    let signLinks:     { email: string; link: string }[] = [];
    let emailSent      = false;
    let signflowError: string | null = null;

    const sfKeySet = !!process.env.SIGNFLOW_API_KEY;
    const signersForEnvelope = allPetitioners
      .filter(s => s.email?.trim())
      .map((s, i) => ({ email: s.email, name: s.name, routingOrder: i + 1 }));

    if (!sfKeySet) {
      signflowError = "SIGNFLOW_API_KEY not configured";
      console.warn("[grievance/submit] SIGNFLOW_API_KEY not set in env — skipping envelope");
    } else if (!pdfBase64) {
      signflowError = "PDF generation failed";
    } else if (signersForEnvelope.length === 0) {
      signflowError = "No signer email provided";
    } else {
      try {
        const envelope = await createSignFlowEnvelope({
          title:              `Grievance Petition – ${ticketNo} – ${title}`,
          documentPdfBase64:  pdfBase64,
          signers:            signersForEnvelope,
          signaturePositions: signaturePositions.slice(0, signersForEnvelope.length),
          send:               true,
        });
        if (envelope) {
          envelopeId = envelope.envelopeId;
          emailSent  = envelope.gmailConfigured;
          signLinks  = envelope.inviteLinks ?? [];
          console.log("[grievance/submit] SignFlow ok | id:", envelopeId,
            "| links:", signLinks.length, "| gmail:", emailSent,
            "| raw:", JSON.stringify(envelope.rawResponse).slice(0, 500));
        } else {
          signflowError = "SignFlow API returned null";
          console.warn("[grievance/submit] SignFlow returned null");
        }
      } catch (sfErr) {
        signflowError = "SignFlow request failed";
        console.error("[grievance/submit] SignFlow failed:", sfErr);
      }
    }

    /* ── 5. Direct email fallback when SignFlow doesn't send ────────── */
    // SignFlow returns gmailConfigured=false when its server email isn't set up.
    // In that case we send the signing link directly from TrustNest via Gmail SMTP.
    if (pdfBase64 && !emailSent) {
      const primarySigner = allPetitioners.find(p => p.email?.trim());
      if (primarySigner?.email) {
        const signerLinks = signLinks.length > 0
          ? signLinks
          : signersForEnvelope.map(s => ({ email: s.email, link: "" }));

        for (const sl of signerLinks) {
          if (!sl.email) continue;
          const petitioner = allPetitioners.find(p => p.email === sl.email);
          await sendSigningInvite({
            to:         sl.email,
            toName:     petitioner?.name ?? sl.email,
            ticketNo,
            title,
            signLink:   sl.link || undefined,
            pdfBase64,
          }).catch(e => console.error("[submit] mailer failed:", e));
        }
      }
    }

    /* ── 6. Telegram notification ─────────────────────────────────── */
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
      filedAt:       filedAt.toISOString(),
      pdfGenerated:  pdfBase64 !== null,
      pdfBase64,
      envelopeId,
      signLinks,
      emailSent,
      signflowError, // null = ok, string = reason it was skipped
    });

  } catch (err) {
    console.error("[grievance/submit]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
