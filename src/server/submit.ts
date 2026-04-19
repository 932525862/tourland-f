import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const submissionSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(4).max(30),
  date: z.string().min(1).max(50),
  people: z.string().min(1).max(10),
  question: z.string().max(1000).optional().default(""),
});

export const submitRegistration = createServerFn({ method: "POST" })
  .inputValidator((input) => submissionSchema.parse(input))
  .handler(async ({ data }) => {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    const errors: string[] = [];

    // 1. Send to Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const text =
        `🆕 <b>Yangi ariza — Xitoy ko'rgazmasi</b>\n\n` +
        `👤 <b>Ism:</b> ${escapeHtml(data.name)}\n` +
        `📞 <b>Telefon:</b> ${escapeHtml(data.phone)}\n` +
        `📅 <b>Sana:</b> ${escapeHtml(data.date)}\n` +
        `👥 <b>Kishilar soni:</b> ${escapeHtml(data.people)}\n` +
        `💬 <b>Qo'shimcha savol:</b> ${escapeHtml(data.question || "—")}`;

      try {
        const tgRes = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text,
              parse_mode: "HTML",
            }),
          }
        );
        if (!tgRes.ok) {
          const body = await tgRes.text();
          console.error("Telegram error:", tgRes.status, body);
          errors.push("telegram");
        }
      } catch (err) {
        console.error("Telegram request failed:", err);
        errors.push("telegram");
      }
    } else {
      console.warn("Telegram secrets not configured");
      errors.push("telegram_not_configured");
    }

    // 2. Send to Google Sheets (Apps Script Web App)
    if (GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        const sheetRes = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            name: data.name,
            phone: data.phone,
            date: data.date,
            people: data.people,
            question: data.question || "",
          }),
        });
        if (!sheetRes.ok) {
          const body = await sheetRes.text();
          console.error("Google Sheets error:", sheetRes.status, body);
          errors.push("sheets");
        }
      } catch (err) {
        console.error("Google Sheets request failed:", err);
        errors.push("sheets");
      }
    } else {
      console.warn("Google Sheets webhook not configured");
      errors.push("sheets_not_configured");
    }

    return { success: true, errors };
  });

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
