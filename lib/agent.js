import Anthropic from "@anthropic-ai/sdk";

// Læser ANTHROPIC_API_KEY fra miljøvariabler
const client = new Anthropic();

const SYSTEM = `Du er Joakims personlige AI-sekretær. Svar på dansk, kort og konkret.
Du har endnu ikke adgang til kalender, mails eller kundehenvendelser.
Hvis du bliver bedt om noget, du ikke kan endnu, så sig det ærligt. Gæt aldrig og opfind aldrig data.`;

// Ren funktion uden Telegram-kode, så kanalen kan skiftes senere.
// userId bruges senere til at holde data adskilt pr. bruger.
export async function runAgent(userId, text) {
  const res = await client.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 1000,
    system: SYSTEM,
    messages: [{ role: "user", content: text }],
  });

  const reply = res.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return reply || "Jeg fik intet svar. Prøv igen.";
}
