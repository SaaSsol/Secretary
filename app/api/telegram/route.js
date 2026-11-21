import { runAgent } from "../../../lib/agent.js";

export const maxDuration = 60;

async function send(chatId, text) {
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

export async function POST(req) {
  // 1) Kun Telegram må kalde denne adresse (fejler lukket, hvis hemmeligheden mangler)
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return new Response("forbidden", { status: 403 });
  }

  const update = await req.json();
  const msg = update.message;
  if (!msg?.text) return Response.json({ ok: true });

  const fromId = String(msg.from.id);
  const allowed = process.env.TELEGRAM_ALLOWED_ID;

  try {
    if (!allowed) {
      // Opsætning: botten fortæller afsenderen sit eget ID, så du kan låse den til dig
      await send(msg.chat.id, `Dit Telegram-ID er ${fromId}. Læg det i TELEGRAM_ALLOWED_ID og deploy igen.`);
    } else if (fromId === allowed) {
      // 2) Kun dig: alle andre ignoreres uden svar
      await send(msg.chat.id, await runAgent(fromId, msg.text));
    }
  } catch (e) {
    console.error(e);
    if (fromId === allowed) await send(msg.chat.id, "Noget gik galt. Prøv igen om lidt.");
  }

  // Svar altid 200, ellers sender Telegram den samme besked igen og igen
  return Response.json({ ok: true });
}
