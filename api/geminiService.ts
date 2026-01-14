import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

type AnyMsg = { role?: any; content?: any };
const VERSION = "geminiService@v7";
type Lang = "es" | "en";

function parseBody(req: VercelRequest) {
  const b: any = (req as any).body;
  if (!b) return {};
  if (typeof b === "string") {
    try {
      return JSON.parse(b);
    } catch {
      return {};
    }
  }
  return b;
}

function sanitizeMessages(input: AnyMsg[]) {
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of input || []) {
    if (!m) continue;
    const role = (m as any).role;
    if (role !== "user" && role !== "assistant") continue;

    const c = (m as any).content;
    if (typeof c === "string") {
      const s = c.trim();
      if (s) out.push({ role, content: s });
      continue;
    }

    if (c === null || c === undefined) continue;

    try {
      const s = String(c).trim();
      if (s) out.push({ role, content: s });
    } catch {
      continue;
    }
  }
  return out;
}

function detectLangFromAllMessages(messages: { role: "user" | "assistant"; content: string }[]): Lang {
  // Si en cualquier parte hay señales claras de español, nos quedamos con ES
  const full = messages.map((m) => m.content).join(" \n ").toLowerCase();

  if (full.includes("español") || full.includes("espanol") || full.includes("en español")) return "es";
  if (full.includes("in english") || full.includes("english")) return "en";

  const spanishHits = [
    "hola",
    "gracias",
    "quiero",
    "reserva",
    "mañana",
    "perro",
    "dueño",
    "teléfono",
    "telefono",
    "vacunas",
    "alergias",
    "esterilizado",
    "castrado",
    "guardería",
    "paseo",
    "hospedaje",
  ];
  const score = spanishHits.reduce((acc, w) => acc + (full.includes(w) ? 1 : 0), 0);
  return score >= 2 ? "es" : "en";
}

function inferServiceFromText(text: string): string | null {
  const t = (text || "").toLowerCase();
  if (t.includes("daycare")) return "Daycare";
  if (t.includes("boarding")) return "Boarding";
  if (t.includes("pet sitting") || t.includes("petsitting")) return "Pet Sitting";
  if (t.includes("dog walk") || t.includes("dogwalk") || t.includes("walk")) return "Dog Walk";
  return null;
}

function tryParseSnackMenu() {
  const raw = process.env.MDC_SNACKS_MENU_JSON || "";
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function labelForMissingField(field: string, lang: Lang): string {
  const es: Record<string, string> = {
    dogName: "Nombre del perro",
    ownerName: "Tu nombre",
    ownerPhone: "Tu teléfono (con prefijo, ej: +44...)",
    dateTime: "Fecha y hora (hora Reino Unido)",
    dogAge: "Edad del perro",
    dogBreed: "Raza del perro",
    vaccinationsUpToDate: "¿Vacunas al día? (Sí/No)",
    neutered: "¿Esterilizado/Castrado? (Sí/No/No estoy seguro)",
    allergies: "¿Alergias? (Ninguna / Detalles)",
    behaviour: "Comportamiento (amigable/nervioso/reactivo/etc.)",
    medicalNotes: "Notas médicas (Ninguna / Detalles)",
  };

  const en: Record<string, string> = {
    dogName: "Dog’s name",
    ownerName: "Your name",
    ownerPhone: "Your phone (with country code, e.g. +44...)",
    dateTime: "Date & time (UK time)",
    dogAge: "Dog’s age",
    dogBreed: "Dog’s breed",
    vaccinationsUpToDate: "Vaccinations up to date? (Yes/No)",
    neutered: "Neutered/Spayed? (Yes/No/Unknown)",
    allergies: "Any allergies? (None / Details)",
    behaviour: "Behaviour (friendly/nervous/reactive/etc.)",
    medicalNotes: "Medical notes (None / Details)",
  };

  return (lang === "es" ? es : en)[field] || field;
}

function looksIncomplete(reply: string) {
  const r = (reply || "").trim();
  if (!r) return true;
  // Si termina en ":" o dice "Please provide..." sin bullets, lo tratamos como incompleto
  if (r.endsWith(":")) return true;
  if (r.toLowerCase().includes("please provide") && !r.includes("•") && !r.includes("- ")) return true;
  return false;
}

function buildProfessionalAsk(service: string, lang: Lang, missing: string[]) {
  const title =
    lang === "es"
      ? `Hola, soy María de Maria’s Dog Corner (Bristol). Para agendar tu **${service}**, por favor confírmame:`
      : `Hi! I’m Maria from Maria’s Dog Corner (Bristol). To book **${service}**, please confirm:`;

  // Manténlo corto: máximo 6 items por mensaje
  const bullets = missing.slice(0, 6).map((f) => `• ${labelForMissingField(f, lang)}`).join("\n");

  return `${title}\n\n${bullets}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const traceId = crypto.randomUUID();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, traceId, version: VERSION, error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ ok: false, traceId, version: VERSION, error: "Missing OPENAI_API_KEY" });
  }

  const body = parseBody(req);
  const rawMessages: AnyMsg[] = Array.isArray(body.messages) ? body.messages : [];
  const leadIn = body.lead || {};

  const messages = sanitizeMessages(rawMessages);
  if (!messages.length) {
    return res.status(400).json({ ok: false, traceId, version: VERSION, error: "No valid messages after sanitize." });
  }

  try {
    const snackMenu = tryParseSnackMenu();

    // Language lock: si lead.language ya viene, úsalo; si no, detecta por TODA la conversación
    const lang: Lang =
      leadIn?.language === "es" || leadIn?.language === "en" ? leadIn.language : detectLangFromAllMessages(messages);

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const system = `
You are Maria, the owner of Maria's Dog Corner in Bristol, UK.

LANGUAGE LOCK (CRITICAL):
- Reply ONLY in ${lang === "es" ? "Spanish" : "English"}.
- Ignore UI/button language; use conversation language.
- If user explicitly asks to switch language, update lead.language and then use ONLY that language.

BUSINESS:
- Services you can book: Daycare, Boarding, Pet Sitting, Dog Walk.
- Do NOT offer Training.

SNACKS:
- Snacks are ONLY 100g packs.
- Flavours: Salmon Delight, Liver Luxury, Beef Bonanza, Chicken & Veggie, Lamb Love, Garden Veggies.
- NEVER say you don't have access to snacks menu or prices.
${snackMenu ? `- Prices from config: ${JSON.stringify(snackMenu)}` : `- If exact prices missing, say flavours + that prices are in "Shop Snacks" on the website.`}

BOOKING FLOW:
- Do NOT set action="create_booking" until all required booking + safety fields are collected.

Required booking fields:
- service (Daycare|Boarding|Pet Sitting|Dog Walk)
- dogName, dogAge, dogBreed
- ownerName, ownerPhone
- date & time (UK time)

Safety fields:
- vaccinationsUpToDate (yes/no)
- neutered (yes/no/unknown)
- allergies (none/details)
- behaviour (friendly/nervous/reactive/etc.)
- medicalNotes (none/details)

TIME:
- User gives time in UK time (Europe/London)
- Convert internally to UTC startISO/endISO
- NEVER mention UTC in the reply.

CONFIRMATION FORMAT:
If action="create_booking", reply must be a clean structured template (no extra paragraphs).

OUTPUT JSON ONLY:
{ "reply":"...", "action":"none|create_booking", "lead":{...}, "booking":{...} or null }

KNOWN CONTEXT:
${JSON.stringify(leadIn || {})}

Today is ${todayStr}.
`.trim();

    const outgoing = [{ role: "system", content: system }, ...messages.slice(-20)];

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: outgoing,
        response_format: { type: "json_object" },
        temperature: 0.35,
      }),
    });

    const data = await r.json().catch(() => ({} as any));
    if (!r.ok) {
      const msg = data?.error?.message || `OpenAI HTTP ${r.status}`;
      return res.status(500).json({ ok: false, traceId, version: VERSION, error: msg });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      return res.status(500).json({ ok: false, traceId, version: VERSION, error: "OpenAI returned empty content" });
    }

    let ai: any;
    try {
      ai = JSON.parse(content);
    } catch {
      return res.status(500).json({ ok: false, traceId, version: VERSION, error: "AI returned invalid JSON" });
    }

    const mergedLead = { ...leadIn, ...(ai.lead || {}), language: ai?.lead?.language || leadIn?.language || lang };

    // Infer service if missing (very common when user just clicked a button)
    if (!mergedLead.service) {
      const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
      const inferred = inferServiceFromText(lastUser);
      if (inferred) mergedLead.service = inferred;
    }

    // ✅ SAFETY NET: si el reply viene incompleto, construimos checklist nosotros
    const service = String(mergedLead.service || "").trim();
    if (service && (typeof ai?.reply !== "string" || looksIncomplete(ai.reply))) {
      // primera tanda (corta) para que no sea eterno
      const missingBasics = [
        !mergedLead.dogName ? "dogName" : null,
        !mergedLead.ownerName ? "ownerName" : null,
        !mergedLead.ownerPhone ? "ownerPhone" : null,
        !mergedLead.dateTime ? "dateTime" : null, // si tú no usas dateTime en lead, puedes quitarlo
      ].filter(Boolean) as string[];

      // si ya tiene lo básico, pide seguridad
      const missingSafety = [
        !mergedLead.dogAge ? "dogAge" : null,
        !mergedLead.dogBreed ? "dogBreed" : null,
        !mergedLead.vaccinationsUpToDate ? "vaccinationsUpToDate" : null,
        !mergedLead.neutered ? "neutered" : null,
        !mergedLead.allergies ? "allergies" : null,
        !mergedLead.behaviour ? "behaviour" : null,
        !mergedLead.medicalNotes ? "medicalNotes" : null,
      ].filter(Boolean) as string[];

      const missing = missingBasics.length ? missingBasics : missingSafety;
      ai.reply = buildProfessionalAsk(service, lang, missing.length ? missing : ["dogName", "ownerName", "ownerPhone", "dateTime"]);
      ai.action = "none";
      ai.booking = null;
    }

    // Si falta reply válido
    if (typeof ai?.reply !== "string" || !ai.reply.trim()) {
      ai.reply =
        lang === "es"
          ? "Hola, soy María de Maria’s Dog Corner (Bristol). ¿Qué servicio te interesa: Daycare, Boarding, Pet Sitting o Dog Walk?"
          : "Hi! I’m Maria from Maria’s Dog Corner (Bristol). Which service are you interested in: Daycare, Boarding, Pet Sitting or Dog Walk?";
      ai.action = "none";
      ai.booking = null;
    }

    return res.status(200).json({
      ok: true,
      traceId,
      version: VERSION,
      reply: ai.reply,
      action: ai.action || "none",
      lead: mergedLead,
      booking: ai.booking || null,
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, traceId, version: VERSION, error: e?.message || "Server error" });
  }
}
