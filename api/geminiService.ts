// api/geminiService.ts
// Vercel Serverless Function
// POST /api/geminiService
// Maria's Dog Corner (Bristol) - Bilingual ES/EN - Services only (NO snacks)

type IncomingHistoryItem = {
  role: "user" | "model" | "assistant";
  parts?: { text: string }[];
  text?: string;
  content?: string;
};

type BookingState = {
  language: "es" | "en";
  dog_name?: string;
  dog_age?: string;
  service?: "daycare" | "boarding" | "walks";
  dates_raw?: string;
  breed?: string;
  owner_name?: string;
  contact_pref?: "webchat" | "whatsapp";
  phone_or_email?: string;
  notes?: string;
};

const fallbackES =
  "Lo siento — tuve un problema técnico. ¿Me confirmas por favor el nombre y edad de tu perrito, qué servicio necesitas (guardería/hotel/paseos) y las fechas?";

const fallbackEN =
  "Sorry — I had a technical issue. Could you confirm your dog’s name & age, the service you need (daycare/boarding/walks), and the dates?";

function getTextFromHistoryItem(item: IncomingHistoryItem): string {
  if (Array.isArray(item.parts) && item.parts.length) {
    return item.parts.map((p) => p.text).filter(Boolean).join("\n").trim();
  }
  return (item.text || item.content || "").trim();
}

function isSpanish(text: string): boolean {
  const t = (text || "").toLowerCase();
  const hits =
    (t.match(/\b(hola|buenas|por favor|necesito|guarderia|guardería|paseo|paseos|hotel|reserva|precio|fechas|años|raza)\b/g) || [])
      .length;
  const hasAccent = /[áéíóúñ¿¡]/.test(t);
  return hits >= 1 || hasAccent;
}

function normalizeDogNameCandidate(s: string): string | undefined {
  const t = (s || "").trim();
  if (!t) return undefined;

  // Avoid treating greetings / generic words as names
  const banned = new Set([
    "hola",
    "buenas",
    "hello",
    "hi",
    "hey",
    "ok",
    "okay",
    "gracias",
    "thanks",
    "si",
    "sí",
    "no",
    "dale",
  ]);
  const clean = t.replace(/[^\p{L}\p{N}\s'-]/gu, "").trim();
  if (!clean) return undefined;
  if (clean.length > 25) return undefined;

  // Single token (or 2 short tokens) usually a name
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1 && !banned.has(parts[0].toLowerCase())) return parts[0];
  if (parts.length === 2 && parts[0].length <= 12 && parts[1].length <= 12) {
    const joined = `${parts[0]} ${parts[1]}`.trim();
    if (!banned.has(parts[0].toLowerCase()) && !banned.has(parts[1].toLowerCase())) return joined;
  }
  return undefined;
}

function extractState(history: IncomingHistoryItem[]): BookingState {
  const userMsgs = history
    .filter((h) => (h.role === "user"))
    .map(getTextFromHistoryItem)
    .filter(Boolean);

  const lastUser = userMsgs[userMsgs.length - 1] || "";
  const language: "es" | "en" = isSpanish(lastUser) ? "es" : "en";

  const joined = userMsgs.join("\n");

  // Dog name patterns
  let dog_name: string | undefined;

  // ES patterns
  const m1 = joined.match(/se llama\s+([A-Za-zÀ-ÖØ-öø-ÿ0-9' -]{2,25})/i);
  if (m1?.[1]) dog_name = m1[1].trim();

  // EN patterns
  const m2 = joined.match(/my dog(?:'s)? name is\s+([A-Za-zÀ-ÖØ-öø-ÿ0-9' -]{2,25})/i);
  if (!dog_name && m2?.[1]) dog_name = m2[1].trim();

  // If still missing: take first short “single word” user msg after greeting
  if (!dog_name) {
    for (const msg of userMsgs) {
      const cand = normalizeDogNameCandidate(msg);
      if (cand) {
        dog_name = cand;
        break;
      }
    }
  }

  // Age patterns
  let dog_age: string | undefined;
  const ageES = joined.match(/(\d{1,2})\s*(años|ano|anos)\b/i);
  if (ageES?.[1]) dog_age = `${ageES[1]} años`;
  const ageEN = joined.match(/(\d{1,2})\s*(years|yrs|yr)\b/i);
  if (!dog_age && ageEN?.[1]) dog_age = `${ageEN[1]} years`;

  // Service detection
  let service: BookingState["service"];
  const low = joined.toLowerCase();
  if (/(guarder[ií]a|daycare)/i.test(low)) service = "daycare";
  else if (/(hotel|boarding|overnight|stay overnight)/i.test(low)) service = "boarding";
  else if (/(paseo|paseos|walks?|dog walk)/i.test(low)) service = "walks";

  // Dates raw (keep simple)
  let dates_raw: string | undefined;
  const dateLine = joined.match(/(del\s+\d{1,2}.*?\d{4}|from\s+\d{1,2}.*?\d{4}|\b\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b.*?(\d{4})?)/i);
  if (dateLine?.[0]) dates_raw = dateLine[0].trim();

  // Breed (very light)
  let breed: string | undefined;
  const brES = joined.match(/raza\s*[:\-]?\s*([A-Za-zÀ-ÖØ-öø-ÿ' -]{3,40})/i);
  if (brES?.[1]) breed = brES[1].trim();
  const brEN = joined.match(/breed\s*[:\-]?\s*([A-Za-zÀ-ÖØ-öø-ÿ' -]{3,40})/i);
  if (!breed && brEN?.[1]) breed = brEN[1].trim();

  return { language, dog_name, dog_age, service, dates_raw, breed };
}

function nextRequiredField(state: BookingState): "dog_name" | "dog_age" | "service" | "dates" | "qualification" | "confirm" {
  if (!state.dog_name) return "dog_name";
  if (!state.dog_age) return "dog_age";
  if (!state.service) return "service";
  if (!state.dates_raw) return "dates";
  return "qualification";
}

function buildSystemPrompt(state: BookingState) {
  const lang = state.language;

  const base = `
You are "Maria", the owner of Maria's Dog Corner (Bristol, UK).
You are a high-converting, professional, friendly SALES assistant for PET CARE SERVICES ONLY:
- Daycare: £35
- Boarding: £45
- Walks: £15
NO snacks / food / treats unless the customer explicitly asks — then answer briefly and redirect back to SERVICES booking.

Business credibility (use naturally, not spammy):
- APHA licence: U1596090
- Home-based care, NO cages
- Small group, calm environment, daily photo updates

BILINGUAL RULE:
- Reply in the same language as the customer's last message (Spanish or English).
- Keep replies concise, warm, and professional. No pet names like "amor".

CONVERSION FLOW (MUST FOLLOW):
1) Capture dog basics: name + age (+ breed if helpful).
2) Identify service (daycare/boarding/walks) + exact dates needed.
3) Qualify quickly (one question at a time): friendly with other dogs? vaccinations up to date? any medical/behaviour notes?
4) Confirm price + value, then close: propose next step to RESERVE.
5) Collect what’s needed to finalize the booking on-site (owner name + preferred contact + phone/email).
6) Output a clear "Booking Summary" in plain language, and ask for confirmation.

CRITICAL RULES:
- Ask ONE question per message.
- Do NOT repeat a question if the customer already answered it.
- If you are missing information, ask ONLY the next missing item.
- Do NOT push WhatsApp immediately. Only offer WhatsApp as optional at the end or if the customer requests it.
`;

  const known = `
KNOWN INFO (use it, don’t ask again):
- Dog name: ${state.dog_name ?? "unknown"}
- Dog age: ${state.dog_age ?? "unknown"}
- Breed: ${state.breed ?? "unknown"}
- Service: ${state.service ?? "unknown"}
- Dates: ${state.dates_raw ?? "unknown"}
`;

  const next = nextRequiredField(state);

  const nextInstructionES: Record<string, string> = {
    dog_name: "Siguiente paso OBLIGATORIO: pregunta el NOMBRE del perro (solo una pregunta).",
    dog_age: `Siguiente paso OBLIGATORIO: pregunta la EDAD de ${state.dog_name ?? "el perrito"} (solo una pregunta).`,
    service: "Siguiente paso OBLIGATORIO: pregunta QUÉ servicio necesita (guardería / hotel / paseos) (solo una pregunta).",
    dates: "Siguiente paso OBLIGATORIO: pregunta LAS FECHAS exactas que necesita (solo una pregunta).",
    qualification:
      "Siguiente paso OBLIGATORIO: haz UNA pregunta de calificación (prioridad: si es sociable con otros perros).",
    confirm:
      "Siguiente paso OBLIGATORIO: confirma la reserva y pide los datos finales (nombre del dueño + contacto).",
  };

  const nextInstructionEN: Record<string, string> = {
    dog_name: "NEXT REQUIRED STEP: ask for the DOG'S NAME (one question only).",
    dog_age: `NEXT REQUIRED STEP: ask for ${state.dog_name ?? "your dog"}'s AGE (one question only).`,
    service: "NEXT REQUIRED STEP: ask which service they need (daycare / boarding / walks) (one question only).",
    dates: "NEXT REQUIRED STEP: ask for the exact dates needed (one question only).",
    qualification: "NEXT REQUIRED STEP: ask ONE qualification question (priority: friendly with other dogs?).",
    confirm: "NEXT REQUIRED STEP: confirm the booking and collect final details (owner name + contact).",
  };

  const nextLine = lang === "es" ? nextInstructionES[next] : nextInstructionEN[next];

  return `${base}\n${known}\n${nextLine}`.trim();
}

function toOpenAIMessages(history: IncomingHistoryItem[]) {
  const msgs = [];
  for (const h of history || []) {
    const content = getTextFromHistoryItem(h);
    if (!content) continue;

    const role =
      h.role === "user" ? "user" : "assistant"; // map "model" -> assistant, "assistant" -> assistant

    msgs.push({ role, content });
  }
  return msgs;
}

export default async function handler(req: any, res: any) {
  // Basic method handling
  if (req.method !== "POST") {
    return res.status(200).json({ ok: false, text: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const history: IncomingHistoryItem[] = Array.isArray(body?.history) ? body.history : [];

    const state = extractState(history);
    const systemPrompt = buildSystemPrompt(state);

    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_APIKEY || process.env.VITE_OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const mariaFallback = state.language === "es" ? fallbackES : fallbackEN;

    if (!apiKey) {
      console.error("Missing OPENAI_API_KEY");
      return res.status(200).json({ ok: false, text: mariaFallback, state });
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...toOpenAIMessages(history),
    ];

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 260,
      }),
    });

    if (!r.ok) {
      const errText = await r.text().catch(() => "");
      console.error("OpenAI error:", r.status, errText);
      return res.status(200).json({ ok: false, text: mariaFallback, state });
    }

    const data = await r.json();
    const text = (data?.choices?.[0]?.message?.content || "").trim() || mariaFallback;

    return res.status(200).json({ ok: true, text, state });
  } catch (e: any) {
    console.error("Function crash:", e?.message || e);
    return res.status(200).json({ ok: false, text: fallbackEN });
  }
}
