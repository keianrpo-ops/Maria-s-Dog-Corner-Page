import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

type AnyMsg = { role?: any; content?: any };
type Lang = "es" | "en";

const VERSION = "mariasDogCorner@v18-fixed-pricing";

const OPENAI_TIMEOUT_MS = 60000;

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

function getUKNowParts() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const pick = (t: string) => parts.find((p) => p.type === t)?.value || "";
  const year = pick("year");
  const month = pick("month");
  const day = pick("day");
  const hour = pick("hour");
  const minute = pick("minute");

  return {
    todayStr: `${year}-${month}-${day}`,
    nowHM: `${hour}:${minute}`,
  };
}

function detectLang(messages: { role: "user" | "assistant"; content: string }[], leadLang?: any): Lang {
  if (leadLang === "es" || leadLang === "en") return leadLang;

  const lastUsers = messages.filter((m) => m.role === "user").slice(-3);
  const txt = lastUsers.map((m) => m.content).join(" \n ").toLowerCase();

  if (txt.includes("español") || txt.includes("espanol") || txt.includes("en español")) return "es";
  if (txt.includes("in english") || txt.includes("english")) return "en";

  const spanishHits = [
    "hola", "gracias", "quiero", "necesito", "mañana", "manana", "guardería", "guarderia",
    "hospedaje", "paseo", "perro", "dueño", "dueno", "teléfono", "telefono", "vacunas",
    "castrado", "esterilizado", "recoger", "entregar", "años", "comporta"
  ];
  const score = spanishHits.reduce((acc, w) => acc + (txt.includes(w) ? 1 : 0), 0);
  return score >= 2 ? "es" : "en";
}

function inferServiceFromText(text: string): string | null {
  if (!text || typeof text !== "string") return null;
  
  const t = text.toLowerCase();

  if (t.includes("dog walk") || t.includes("dogwalk") || t.includes("walk")) return "Dog Walk";
  if (t.includes("home sitting") || t.includes("sitting")) return "Home Sitting";
  if (t.includes("boarding") || t.includes("vacation care")) return "Boarding";
  if (t.includes("grooming")) return "Grooming";
  if (t.includes("pop-in") || t.includes("pop in") || t.includes("visit")) return "Pop-in Visits";

  if (t.includes("paseo")) return "Dog Walk";
  if (t.includes("cuidado") && t.includes("casa")) return "Home Sitting";
  if (t.includes("hospedaje") || t.includes("alojamiento")) return "Boarding";

  return null;
}

function isUserConfirming(text: string, lang: Lang) {
  if (!text || typeof text !== "string") return false;
  
  const t = text.trim().toLowerCase();
  if (!t) return false;
  
  const yesES = ["si", "sí", "confirmo", "confirmar", "dale", "ok", "listo", "de acuerdo", "perfecto", "correcto"];
  const yesEN = ["yes", "confirm", "confirmed", "ok", "okay", "go ahead", "sounds good", "perfect", "correct", "right"];
  const pool = lang === "es" ? yesES : yesEN;
  return pool.some((w) => t === w || t.startsWith(w + " ") || t.endsWith(" " + w));
}

function buildInitialGreeting(service: string, lang: Lang): string {
  if (lang === "es") {
    return `¡Hola! Soy Maria 😊\n\nVeo que estás interesado en **${service}**. ¡Perfecto!\n\nPara reservar solo necesito:\n1. Nombre del perro\n2. Edad del perro\n3. Tu nombre\n4. Tu teléfono (ej: +44...)\n5. Fecha y hora de inicio\n6. Fecha y hora de fin\n\nPuedes darme toda la información junta si lo prefieres 😊`;
  }

  return `Hello! I'm Maria 😊\n\nI see you're interested in **${service}**. Perfect!\n\nTo book, I just need:\n1. Dog's name\n2. Dog's age\n3. Your name\n4. Your phone (e.g. +44...)\n5. Start date & time\n6. End date & time\n\nYou can give me all the information at once if you prefer 😊`;
}

function fmtUKRange(startISO: string, endISO?: string) {
  const tz = "Europe/London";
  const fmtDate = new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const fmtTime = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false });

  const s = new Date(startISO);
  const e = endISO ? new Date(endISO) : null;

  const sD = fmtDate.format(s);
  const sT = fmtTime.format(s);
  if (!e) return `${sD} ${sT}`;

  const eD = fmtDate.format(e);
  const eT = fmtTime.format(e);

  return sD === eD ? `${sD} ${sT}–${eT}` : `${sD} ${sT} → ${eD} ${eT}`;
}

function buildConfirmation(lang: Lang, payload: {
  service: string;
  dogName?: string;
  dogAge?: string;
  dogBreed?: string;
  ownerName?: string;
  ownerPhone?: string;
  startISO: string;
  endISO: string;
}) {
  const range = fmtUKRange(payload.startISO, payload.endISO);

  if (lang === "es") {
    return (
      `Perfecto. Confírmame si todo está correcto:\n\n` +
      `Servicio: ${payload.service}\n` +
      `Perro: ${payload.dogName || "-"}${payload.dogAge ? ` (${payload.dogAge})` : ""}${payload.dogBreed ? ` - ${payload.dogBreed}` : ""}\n` +
      `Dueño: ${payload.ownerName || "-"}\n` +
      `Teléfono: ${payload.ownerPhone || "-"}\n` +
      `Horario: ${range}\n\n` +
      `Responde "sí" para confirmar y ver el precio, o dime qué quieres cambiar.`
    );
  }

  return (
    `Perfect. Please confirm everything is correct:\n\n` +
    `Service: ${payload.service}\n` +
    `Dog: ${payload.dogName || "-"}${payload.dogAge ? ` (${payload.dogAge})` : ""}${payload.dogBreed ? ` - ${payload.dogBreed}` : ""}\n` +
    `Owner: ${payload.ownerName || "-"}\n` +
    `Phone: ${payload.ownerPhone || "-"}\n` +
    `Schedule: ${range}\n\n` +
    `Reply "yes" to confirm and see the price, or tell me what to change.`
  );
}

function ukLocalToUTCISO(local: string) {
  if (!local || typeof local !== "string") return null;
  
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(local.trim());
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);

  const tz = "Europe/London";
  const desiredLocalMs = Date.UTC(year, month - 1, day, hour, minute, 0);

  let guess = new Date(desiredLocalMs);
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(guess);

    const pick = (t: string) => parts.find((p) => p.type === t)?.value || "00";
    const ay = Number(pick("year"));
    const am = Number(pick("month"));
    const ad = Number(pick("day"));
    const ah = Number(pick("hour"));
    const ami = Number(pick("minute"));
    const as = Number(pick("second"));

    const actualLocalMs = Date.UTC(ay, am - 1, ad, ah, ami, as);
    const diff = desiredLocalMs - actualLocalMs;
    if (diff === 0) break;
    guess = new Date(guess.getTime() + diff);
  }

  return guess.toISOString();
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const traceId = crypto.randomUUID();

  console.log(`🔵 [${traceId}] New request received`);

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, traceId, version: VERSION, error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!OPENAI_API_KEY) {
    console.error(`❌ [${traceId}] Missing OPENAI_API_KEY`);
    return res.status(500).json({ ok: false, traceId, version: VERSION, error: "Missing OPENAI_API_KEY" });
  }

  const body = parseBody(req);
  const rawMessages: AnyMsg[] = Array.isArray(body.messages) ? body.messages : [];
  const leadIn = body.lead || {};

  const messages = sanitizeMessages(rawMessages);
  if (!messages.length) {
    console.error(`❌ [${traceId}] No valid messages`);
    return res.status(400).json({ ok: false, traceId, version: VERSION, error: "No valid messages" });
  }

  console.log(`📨 [${traceId}] Messages count: ${messages.length}`);

  const { todayStr, nowHM } = getUKNowParts();
  const lang: Lang = detectLang(messages, leadIn?.language);

  console.log(`🌍 [${traceId}] Language: ${lang}`);

  const lastUserText = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const userConfirmed = isUserConfirming(lastUserText, lang);

  const inferredService = inferServiceFromText(lastUserText);
  const leadService = String(leadIn?.service || inferredService || "").trim();

  if (leadService && messages.length === 2 && messages[1].role === "user") {
    console.log(`👋 [${traceId}] Returning initial greeting for ${leadService}`);
    const greeting = buildInitialGreeting(leadService, lang);
    return res.status(200).json({
      ok: true,
      traceId,
      version: VERSION,
      reply: greeting,
      action: "none",
      lead: { ...leadIn, service: leadService, language: lang },
      booking: null,
    });
  }

  const system = `You are Maria, owner of Maria's Dog Corner in Bristol, UK.

CURRENT TIME: ${todayStr} at ${nowHM} (Europe/London timezone)

LANGUAGE: Reply in ${lang === "es" ? "Spanish" : "English"} ONLY. Be warm, friendly, and natural.

YOUR ROLE:
- You're a real person, not a robot
- Be conversational and empathetic
- Keep responses concise (2-4 sentences typically)
- Use natural language, avoid being overly formal

AVAILABLE SERVICES (Official from https://www.mariasdogcorner.co.uk/):

1. **Dog Walk** - FROM £15/hour
   - Collect: duration in hours
   - Example: "1 hour walk" = 1 hour

2. **Home Sitting** - £45 per night
   - Collect: number of nights
   - Example: "3 nights" = 3 nights

3. **Boarding (Vacation Care)** - CUSTOM pricing
   - This requires a personalized quote
   - Tell user: "This service requires a custom quote based on your dog's needs. Please contact us via WhatsApp for a personalized price."
   - DO NOT proceed with booking for this service
   - Redirect to WhatsApp

4. **Grooming** - FROM £35 (depends on dog size)
   - IMPORTANT: Ask for dog's breed or weight to determine size
   - Small dogs (up to 10kg): £35
   - Medium dogs (10-25kg): £45
   - Large dogs (25-40kg): £55
   - XLarge dogs (over 40kg): £70
   - Collect: dog breed or weight

5. **Pop-in Visits** - £12 per visit
   - Collect: number of visits
   - Example: "1 visit" = 1 visit

IMPORTANT PRICING RULES:
⚠️ YOU DO NOT CALCULATE PRICES - The system will calculate them automatically
⚠️ Just collect the necessary information
⚠️ Do NOT mention specific prices in your responses
⚠️ For Grooming, always ask about dog breed or size
⚠️ For Boarding, always redirect to WhatsApp

SIMPLIFIED BOOKING PROCESS (6 THINGS NEEDED):
1. Dog's name
2. Dog's age
3. Dog's breed (especially for Grooming)
4. Owner's name
5. Owner's phone (with +44 prefix)
6. Service dates & times (start and end)

IMPORTANT: DO NOT ask about allergies, behavior, special needs, etc. Those will be collected via WhatsApp form AFTER payment.

BOOKING FLOW:
1. Identify the service
2. Collect the 6 required items naturally (one or two at a time)
3. When you have all info, show confirmation summary (WITHOUT price)
4. Wait for user to confirm (says "yes", "sí", "confirm", etc.)
5. After confirmation, system will calculate price and show payment button

DATE/TIME HANDLING:
- Today is ${todayStr}
- If user says "tomorrow", it's the day after ${todayStr}
- Accept any time format (8am, 8:00, 20:00, etc.) and convert to 24-hour format
- Format times as "YYYY-MM-DD HH:mm" in startLocal/endLocal
- ALWAYS verify end time is after start time

CONVERSATION EXAMPLES:

Example 1 - Dog Walk:
User: "I need a dog walk for 2 hours"
You: "Perfect! A 2-hour walk sounds great. Could you tell me your dog's name and age?"

Example 2 - Grooming:
User: "I want grooming for my dog"
You: "Excellent! To give you an accurate price, what breed is your dog?"

Example 3 - Boarding:
User: "I need boarding for a week"
You: "Boarding is a wonderful service! This requires a personalized quote based on your dog's specific needs. Could you contact us via WhatsApp so we can discuss the details and give you an exact price?"

CONVERSATION STYLE:
- Thank users for information they provide
- Be encouraging and positive
- If user makes a joke, respond naturally
- If user seems unsure, reassure them
- Use emojis sparingly (😊 🐕)

IMPORTANT RULES:
- NEVER create a booking (action: "create_booking") until user explicitly confirms
- NEVER mention specific prices (the system calculates them)
- NEVER ask about allergies, medical conditions, behavior, or special needs
- NEVER repeat the same question twice
- For Boarding, ALWAYS redirect to WhatsApp instead of creating booking
- For Grooming, ALWAYS ask about breed/size if not provided
- If user is correcting dates/times, set fixDuplicate: true

JSON OUTPUT FORMAT:
{
  "reply": "Your natural, conversational response",
  "action": "none" | "create_booking",
  "lead": {
    "language": "${lang}",
    "service": "Dog Walk",
    "dogName": "Max",
    "dogAge": "3 years",
    "dogBreed": "Golden Retriever",
    "ownerName": "John Smith",
    "ownerPhone": "+44 7700 900000",
    "startLocal": "2026-01-20 09:00",
    "endLocal": "2026-01-20 11:00"
  },
  "booking": null or {
    "service": "Dog Walk",
    "dogName": "Max",
    "dogAge": "3 years",
    "dogBreed": "Golden Retriever",
    "ownerName": "John Smith",
    "ownerPhone": "+44 7700 900000",
    "startLocal": "2026-01-20 09:00",
    "endLocal": "2026-01-20 11:00",
    "notes": "2-hour walk",
    "fixDuplicate": false
  }
}`;

  try {
    const outgoing = [{ role: "system", content: system }, ...messages.slice(-16)];
    console.log(`🤖 [${traceId}] Calling OpenAI API (${model})...`);
    const startTime = Date.now();

    const r = await fetchWithTimeout(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: outgoing,
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      },
      OPENAI_TIMEOUT_MS
    );

    const elapsed = Date.now() - startTime;
    console.log(`✅ [${traceId}] OpenAI responded in ${elapsed}ms`);

    const data = await r.json().catch(() => ({} as any));
    if (!r.ok) {
      const msg = data?.error?.message || `OpenAI HTTP ${r.status}`;
      console.error(`❌ [${traceId}] OpenAI error: ${msg}`);
      return res.status(500).json({ ok: false, traceId, version: VERSION, error: msg });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      console.error(`❌ [${traceId}] Empty AI response`);
      return res.status(500).json({ ok: false, traceId, version: VERSION, error: "Empty AI response" });
    }

    let ai: any;
    try {
      ai = JSON.parse(content);
    } catch {
      console.error(`❌ [${traceId}] Invalid AI JSON`);
      return res.status(500).json({ ok: false, traceId, version: VERSION, error: "Invalid AI JSON" });
    }

    const mergedLead: any = { ...leadIn, ...(ai.lead || {}) };
    mergedLead.language = mergedLead.language === "es" || mergedLead.language === "en" ? mergedLead.language : lang;

    if (!mergedLead.service && leadService) mergedLead.service = leadService;
    if (!mergedLead.service && inferredService) mergedLead.service = inferredService;

    let booking: any = ai.booking || null;
    if (booking && !booking.service && mergedLead.service) booking.service = mergedLead.service;
    if (booking && !booking.dogName && mergedLead.dogName) booking.dogName = mergedLead.dogName;
    if (booking && !booking.ownerName && mergedLead.ownerName) booking.ownerName = mergedLead.ownerName;
    if (booking && !booking.ownerPhone && mergedLead.ownerPhone) booking.ownerPhone = mergedLead.ownerPhone;
    if (booking && !booking.dogAge && mergedLead.dogAge) booking.dogAge = mergedLead.dogAge;
    if (booking && !booking.dogBreed && mergedLead.dogBreed) booking.dogBreed = mergedLead.dogBreed;

    if (booking) {
      if (!booking.startLocal && mergedLead.startLocal) booking.startLocal = mergedLead.startLocal;
      if (!booking.endLocal && mergedLead.endLocal) booking.endLocal = mergedLead.endLocal;
    }

    if (booking) {
      if (!booking.startISO && booking.startLocal) booking.startISO = ukLocalToUTCISO(String(booking.startLocal));
      if (!booking.endISO && booking.endLocal) booking.endISO = ukLocalToUTCISO(String(booking.endLocal));
    }

    const service = String(mergedLead.service || booking?.service || "").trim();
    const dogName = String(mergedLead.dogName || booking?.dogName || "").trim();
    const dogBreed = String(mergedLead.dogBreed || booking?.dogBreed || "").trim();
    const ownerName = String(mergedLead.ownerName || booking?.ownerName || "").trim();
    const ownerPhone = String(mergedLead.ownerPhone || booking?.ownerPhone || "").trim();
    const startISO = booking?.startISO ? String(booking.startISO) : "";
    const endISO = booking?.endISO ? String(booking.endISO) : "";

    if (!startISO || !endISO || isNaN(new Date(startISO).getTime()) || isNaN(new Date(endISO).getTime())) {
      console.log(`⏳ [${traceId}] Missing or invalid dates, continuing conversation`);
      return res.status(200).json({
        ok: true,
        traceId,
        version: VERSION,
        reply: ai.reply || (lang === "es" ? "Cuéntame más detalles 😊" : "Tell me more details 😊"),
        action: "none",
        lead: mergedLead,
        booking: null,
      });
    }

    if (new Date(endISO) <= new Date(startISO)) {
      console.log(`⚠️ [${traceId}] Invalid date range: end <= start`);
      const msg = lang === "es"
        ? "Veo que la hora de fin debe ser después de la hora de inicio. ¿Puedes confirmarme los horarios de nuevo?"
        : "I see the end time needs to be after the start time. Can you confirm the times again?";
      return res.status(200).json({
        ok: true,
        traceId,
        version: VERSION,
        reply: msg,
        action: "none",
        lead: mergedLead,
        booking: null,
      });
    }

    if (!userConfirmed && dogName && ownerName && ownerPhone) {
      console.log(`📋 [${traceId}] Sending confirmation request`);
      const reply = buildConfirmation(lang, {
        service,
        dogName,
        dogAge: mergedLead.dogAge || booking?.dogAge,
        dogBreed: dogBreed || undefined,
        ownerName,
        ownerPhone,
        startISO,
        endISO,
      });

      mergedLead.service = service;
      mergedLead.dogName = dogName;
      mergedLead.ownerName = ownerName;
      mergedLead.ownerPhone = ownerPhone;
      if (dogBreed) mergedLead.dogBreed = dogBreed;

      return res.status(200).json({
        ok: true,
        traceId,
        version: VERSION,
        reply,
        action: "none",
        lead: mergedLead,
        booking: {
          ...booking,
          service,
          dogName,
          ownerName,
          ownerPhone,
          dogBreed: dogBreed || undefined,
          startISO,
          endISO,
          fixDuplicate: Boolean(booking?.fixDuplicate) || /cambiar|modificar|corrige|change|modify|correct/i.test(lastUserText),
        },
      });
    }

    if (userConfirmed && dogName && ownerName && ownerPhone) {
      console.log(`✅ [${traceId}] User confirmed, creating booking for price calculation`);
      
      const finalBooking = {
        ...booking,
        service,
        dogName,
        ownerName,
        ownerPhone,
        dogBreed: dogBreed || undefined,
        startISO,
        endISO,
        notes: booking?.notes || `${service}: ${booking?.startLocal || startISO} to ${booking?.endLocal || endISO}`,
        fixDuplicate: Boolean(booking?.fixDuplicate) || /cambiar|modificar|corrige|change|modify|correct/i.test(lastUserText),
        language: lang,
      };

      const finalReply = lang === "es"
        ? `¡Perfecto! Voy a calcular el precio exacto para tu reserva.`
        : `Perfect! I'll calculate the exact price for your booking.`;

      return res.status(200).json({
        ok: true,
        traceId,
        version: VERSION,
        reply: finalReply,
        action: "create_booking",
        lead: mergedLead,
        booking: finalBooking,
      });
    }

    console.log(`💬 [${traceId}] Continuing conversation`);
    return res.status(200).json({
      ok: true,
      traceId,
      version: VERSION,
      reply: ai.reply || (lang === "es" ? "Cuéntame más 😊" : "Tell me more 😊"),
      action: "none",
      lead: mergedLead,
      booking: null,
    });
  } catch (e: any) {
    console.error(`❌ [${traceId}] Handler error:`, e);
    return res.status(500).json({
      ok: false,
      traceId,
      version: VERSION,
      error: e?.message || "Server error"
    });
  }
}