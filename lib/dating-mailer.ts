import nodemailer from "nodemailer";

function createTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

const from = () =>
  `"TrustNest Hearts" <${process.env.GMAIL_USER ?? "noreply@trustnest.in"}>`;

function baseLayout(content: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body{font-family:-apple-system,sans-serif;background:#fff5f5;margin:0;padding:20px}
  .card{max-width:540px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08)}
  .header{background:linear-gradient(135deg,#f43f5e,#db2777);padding:28px 32px;color:#fff}
  .header h1{margin:0;font-size:20px;font-weight:700}
  .header p{margin:4px 0 0;font-size:13px;opacity:.85}
  .body{padding:28px 32px}
  .btn{display:inline-block;background:linear-gradient(135deg,#f43f5e,#db2777);color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;margin-top:16px}
  .footer{padding:16px 32px;border-top:1px solid #fce7f3;text-align:center;font-size:11px;color:#9ca3af}
</style></head><body><div class="card">
  <div class="header">
    <h1>❤️ TrustNest Hearts</h1>
    <p>India's verified dating platform for divorced individuals</p>
  </div>
  <div class="body">${content}</div>
  <div class="footer">© ${new Date().getFullYear()} TrustNest Hearts · Your privacy is our priority</div>
</div></body></html>`;
}

async function send(to: string, subject: string, html: string) {
  const transport = createTransport();
  if (!transport) {
    console.warn("[dating-mailer] GMAIL_USER/GMAIL_APP_PASS not set — skipping email");
    return;
  }
  try {
    await transport.sendMail({ from: from(), to, subject, html });
    console.log("[dating-mailer] sent to", to, "|", subject);
  } catch (err) {
    console.error("[dating-mailer] failed:", err);
  }
}

export async function sendMatchEmail(to: string, toName: string, matchName: string) {
  await send(
    to,
    `💕 You matched with ${matchName} on TrustNest Hearts!`,
    baseLayout(`
      <p>Hi <strong>${toName}</strong>,</p>
      <p>Great news — you and <strong>${matchName}</strong> have liked each other. It's a match!</p>
      <p>Send them a message and start a conversation. Remember to be kind and respectful.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dating/matches" class="btn">Open Chat →</a>
      <p style="margin-top:20px;font-size:13px;color:#6b7280">
        Tip: Introduce yourself and mention something from their profile. Personalised messages get 3× more replies!
      </p>
    `)
  );
}

export async function sendMessageEmail(
  to: string,
  toName: string,
  senderName: string,
  preview: string,
  matchId: string
) {
  const snippet = preview.length > 80 ? preview.slice(0, 80) + "…" : preview;
  await send(
    to,
    `💬 New message from ${senderName}`,
    baseLayout(`
      <p>Hi <strong>${toName}</strong>,</p>
      <p><strong>${senderName}</strong> sent you a message on TrustNest Hearts:</p>
      <div style="background:#fdf2f8;border-left:4px solid #f43f5e;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0;font-style:italic;color:#374151">
        "${snippet}"
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dating/matches" class="btn">Reply Now →</a>
    `)
  );
}

export async function sendVerificationStatusEmail(
  to: string,
  toName: string,
  status: "VERIFIED" | "REJECTED",
  caseRef: string,
  rejectionNote?: string | null
) {
  if (status === "VERIFIED") {
    await send(
      to,
      "✅ Your court case has been verified — Welcome to TrustNest Hearts!",
      baseLayout(`
        <p>Hi <strong>${toName}</strong>,</p>
        <p>Your divorce case <strong>${caseRef}</strong> has been successfully verified.</p>
        <p>You now have full access to TrustNest Hearts. Set up your profile and start discovering people near you.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dating/setup" class="btn">Set Up My Profile →</a>
      `)
    );
  } else {
    await send(
      to,
      "⚠️ Verification update — Action required",
      baseLayout(`
        <p>Hi <strong>${toName}</strong>,</p>
        <p>We were unable to verify your divorce case <strong>${caseRef}</strong>.</p>
        ${rejectionNote ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;margin:16px 0;color:#991b1b">${rejectionNote}</div>` : ""}
        <p>Please double-check your case details and re-apply, or contact our support team if you believe this is an error.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dating/register" class="btn">Re-apply →</a>
      `)
    );
  }
}
