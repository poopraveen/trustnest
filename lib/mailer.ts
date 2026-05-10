/**
 * Direct email sender — used when SignFlow's Gmail is not configured.
 * Sends signing invite + PDF download link to each petitioner.
 *
 * Requires in .env:
 *   GMAIL_USER      = your-email@gmail.com
 *   GMAIL_APP_PASS  = 16-char app password from
 *                     https://myaccount.google.com/apppasswords
 *                     (2FA must be enabled on the Gmail account)
 */

import nodemailer from "nodemailer";

function createTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export interface SigningMailOptions {
  to:        string;
  toName:    string;
  ticketNo:  string;
  title:     string;
  signLink?: string;   // SignFlow invite URL (if available)
  pdfBase64?:string;   // attach PDF (optional)
}

export async function sendSigningInvite(opts: SigningMailOptions): Promise<boolean> {
  const transport = createTransport();
  if (!transport) {
    console.warn("[mailer] GMAIL_USER / GMAIL_APP_PASS not set — skipping email");
    return false;
  }

  const fromName  = "TN Vettri Grievance Portal";
  const fromEmail = process.env.GMAIL_USER!;
  const subject   = `Action Required: Sign Your Grievance Petition – ${opts.ticketNo}`;

  const signSection = opts.signLink
    ? `<p style="margin:16px 0">
         <a href="${opts.signLink}"
            style="background:#15803d;color:#fff;padding:12px 28px;border-radius:8px;
                   text-decoration:none;font-weight:bold;font-size:15px;display:inline-block">
           ✍️ Sign Petition Online
         </a>
       </p>
       <p style="color:#6b7280;font-size:12px">
         Or copy this link: <a href="${opts.signLink}">${opts.signLink}</a>
       </p>`
    : `<p style="color:#6b7280">Your signed copy will be emailed once the petition is processed.</p>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:20px">
  <div style="background:#14532d;color:#fff;padding:20px 24px;border-radius:10px 10px 0 0">
    <div style="font-size:18px;font-weight:bold">Government of Tamil Nadu</div>
    <div style="font-size:12px;color:#bbf7d0;margin-top:4px">Citizen Grievance Portal · TN Vettri</div>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px">
    <p style="margin:0 0 12px">Dear <strong>${opts.toName}</strong>,</p>
    <p>Your grievance petition has been successfully filed. Please sign the petition document to complete the process.</p>

    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0">
      <div style="font-size:12px;color:#15803d;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px">Petition Details</div>
      <div style="margin-top:8px"><strong>Ticket No:</strong> ${opts.ticketNo}</div>
      <div style="margin-top:4px"><strong>Subject:</strong> ${opts.title}</div>
    </div>

    ${signSection}

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
    <p style="font-size:12px;color:#9ca3af">
      This is an automated notification from the Tamil Nadu Citizen Grievance Portal.
      Your petition will be processed within 30 days as per the Tamil Nadu Grievance Redressal Act.
    </p>
  </div>
</body>
</html>`;

  const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
  if (opts.pdfBase64) {
    attachments.push({
      filename:    `Grievance_Petition_${opts.ticketNo}.pdf`,
      content:     Buffer.from(opts.pdfBase64, "base64"),
      contentType: "application/pdf",
    });
  }

  try {
    const info = await transport.sendMail({
      from:        `"${fromName}" <${fromEmail}>`,
      to:          `"${opts.toName}" <${opts.to}>`,
      subject,
      html,
      attachments,
    });
    console.log("[mailer] Email sent to", opts.to, "| msgId:", info.messageId);
    return true;
  } catch (err) {
    console.error("[mailer] sendMail failed:", err);
    return false;
  }
}
