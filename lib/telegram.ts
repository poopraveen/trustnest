/**
 * Telegram notification helper — used by the grievance submit API.
 * Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env
 */

const TELEGRAM_API = "https://api.telegram.org";

interface SendMessageOptions {
  text: string;
  parseMode?: "HTML" | "MarkdownV2";
  disableNotification?: boolean;
}

export async function sendTelegramMessage(opts: SendMessageOptions): Promise<boolean> {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping notification");
    return false;
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id:    chatId,
        text:       opts.text,
        parse_mode: opts.parseMode ?? "HTML",
        disable_notification: opts.disableNotification ?? false,
      }),
    });

    const json = await res.json();
    if (!json.ok) {
      console.error("[Telegram] API error:", json.description);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Telegram] fetch failed:", err);
    return false;
  }
}

/** Escape special characters for MarkdownV2 (not needed for HTML mode) */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Build the grievance notification message (HTML format) */
export function buildGrievanceMessage(data: {
  ticketNo:    string;
  name:        string;
  phone:       string;
  email:       string;
  district:    string;
  block:       string;
  locality:    string;
  localityType:string;
  address:     string;
  category:    string;
  title:       string;
  description: string;
  filedAt:     Date;
}): string {
  const slaDate = new Date(data.filedAt);
  slaDate.setDate(slaDate.getDate() + 30);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) +
    " " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata", hour12: true }) +
    " IST";

  const e = escapeHtml;

  return [
    `🚨 <b>NEW GRIEVANCE FILED — <code>${e(data.ticketNo)}</code></b>`,
    ``,
    `📍 <b>Location</b>`,
    `  ├ District : ${e(data.district)}`,
    `  ├ Block    : ${e(data.block)}`,
    `  ├ Locality : ${e(data.locality)} <i>[${e(data.localityType)}]</i>`,
    data.address ? `  └ Address  : ${e(data.address)}` : `  └ ─`,
    ``,
    `🏷️ <b>Category :</b> ${e(data.category)}`,
    `📋 <b>Subject  :</b> ${e(data.title)}`,
    data.description
      ? `📝 <b>Detail   :</b> ${e(data.description.slice(0, 200))}${data.description.length > 200 ? "…" : ""}`
      : "",
    ``,
    `👤 <b>Filed By</b>`,
    `  ├ Name  : ${e(data.name)}`,
    `  ├ Phone : ${e(data.phone)}`,
    data.email ? `  └ Email : ${e(data.email)}` : `  └ ─`,
    ``,
    `📅 <b>Filed   :</b> ${fmt(data.filedAt)}`,
    `⏱️ <b>SLA Due  :</b> ${fmt(slaDate)}`,
    ``,
    `<i>Tamil Nadu Grievance Portal · TN Vettri · 30-day SLA</i>`,
  ]
    .filter(line => line !== null && line !== undefined)
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n");
}
