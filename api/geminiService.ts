import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

type AnyMsg = { role?: any; content?: any };
type Lang = "es" | "en";

const VERSION = "mariasDogCorner@v17-simplified-flow";

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

  if (t.includes("daycare")) return "Daycare";
  if (t.includes("boarding")) return "Boarding";
  if (t.includes("pet sitting") || t.includes("petsitting")) return "Pet Sitting";
  if (t.includes("dog walk") || t.includes("dogwalk") || t.includes("walk")) return "Dog Walk";
  if (t.includes("grooming")) return "Grooming";

  if (t.includes("guarderia") || t.includes("guardería")) return "Daycare";
  if (t.includes("hospedaje") || t.includes("alojamiento")) return "Boarding";
  if (t.includes("cuidado") && t.includes("casa")) return "Pet Sitting";
  if (t.includes("paseo")) return "Dog Walk";

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
    return `¡Hola! Soy Maria 😊\n\nVeo que estás interesado en **${service}**. ¡Perfecto!\n\nPara reservar solo necesito:\n1. Nombre del perro\n2. Edad del perro\n3. Tu nombre\n4. Tu teléfono (ej: +44...)\n5. Fecha y hora de entrega\n6. Fecha y hora de recogida\n\nPuedes darme toda la información junta si lo prefieres 😊`;
  }

  return `Hello! I'm Maria 😊\n\nI see you're interested in **${service}**. Perfect!\n\nTo book, I just need:\n1. Dog's name\n2. Dog's age\n3. Your name\n4. Your phone (e.g. +44...)\n5. Drop-off date & time\n6. Pick-up date & time\n\nYou can give me all the information at once if you prefer 😊`;
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

function getUKDatePartsFromISO(iso: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));

  const pick = (t: string) => parts.find((p) => p.type === t)?.value || "";
  return { y: Number(pick("year")), m: Number(pick("month")), d: Number(pick("day")) };
}

function daysDiffInclusiveUK(startISO: string, endISO: string) {
  const s = getUKDatePartsFromISO(startISO);
  const e = getUKDatePartsFromISO(endISO);
  const sMs = Date.UTC(s.y, s.m - 1, s.d);
  const eMs = Date.UTC(e.y, e.m - 1, e.d);
  const diff = Math.round((eMs - sMs) / 86400000);
  return diff + 1;
}

function nightsDiffUK(startISO: string, endISO: string) {
  const s = getUKDatePartsFromISO(startISO);
  const e = getUKDatePartsFromISO(endISO);
  const sMs = Date.UTC(s.y, s.m - 1, s.d);
  const eMs = Date.UTC(e.y, e.m - 1, e.d);
  const diff = Math.round((eMs - sMs) / 86400000);
  return Math.max(1, diff);
}

function hoursDiff(startISO: string, endISO: string) {
  const ms = new Date(endISO).getTime() - new Date(startISO).getTime();
  const h = ms / 3600000;
  return Math.max(1, Math.ceil(h * 2) / 2);
}

function computePriceGBP(service: string, startISO: string, endISO: string) {
  if (!service || typeof service !== "string") {
    return { total: 0, detail: "Price TBD" };
  }
  
  const s = service.toLowerCase();
  
  if (s === "daycare") {
    const days = daysDiffInclusiveUK(startISO, endISO);
    if (days === 5) return { total: 130, detail: "Full Week Special (5 days)" };
    return { total: 30 * days, detail: `${days} day(s) × £30` };
  }
  if (s === "boarding") {
    const nights = nightsDiffUK(startISO, endISO);
    return { total: 40 * nights, detail: `${nights} night(s) × £40` };
  }
  if (s === "pet sitting" || s === "dog walk" || s === "grooming") {
    const hrs = hoursDiff(startISO, endISO);
    return { total: 15 * hrs, detail: `${hrs} hour(s) × £15` };
  }
  return { total: 0, detail: "Price TBD" };
}

function buildConfirmation(lang: Lang, payload: {
  service: string;
  dogName?: string;
  dogAge?: string;
  ownerName?: string;
  ownerPhone?: string;
  startISO: string;
  endISO: string;
  priceLine: string;
}) {
  const range = fmtUKRange(payload.startISO, payload.endISO);

  if (lang === "es") {
    return (
      `Perfecto. Confírmame si todo está correcto:\n\n` +
      `Servicio: ${payload.service}\n` +
      `Perro: ${payload.dogName || "-"}${payload.dogAge ? ` (${payload.dogAge})` : ""}\n` +
      `Dueño: ${payload.ownerName || "-"}\n` +
      `Teléfono: ${payload.ownerPhone || "-"}\n` +
      `Horario: ${range}\n` +
      `Total: ${payload.priceLine}\n\n` +
      `Responde "sí" para confirmar o dime qué quieres cambiar.`
    );
  }

  return (
    `Perfect. Please confirm everything is correct:\n\n` +
    `Service: ${payload.service}\n` +
    `Dog: ${payload.dogName || "-"}${payload.dogAge ? ` (${payload.dogAge})` : ""}\n` +
    `Owner: ${payload.ownerName || "-"}\n` +
    `Phone: ${payload.ownerPhone || "-"}\n` +
    `Schedule: ${range}\n` +
    `Total: ${payload.priceLine}\n\n` +
    `Reply "yes" to confirm, or tell me what to change.`
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

SERVICES & PRICING:
- Daycare: £30/day (default 09:00-17:00, but flexible)
- Boarding: £40/night
- Pet Sitting: £15/hour
- Dog Walk: £15/hour
- Grooming: £15/hour
- Full Week: £130 for 5 days (Mon-Fri)

SIMPLIFIED BOOKING PROCESS (ONLY 6 THINGS NEEDED):
1. Dog's name
2. Dog's age
3. Owner's name
4. Owner's phone (with +44 prefix)
5. Drop-off date & time
6. Pick-up date & time

IMPORTANT: DO NOT ask about allergies, behavior, breed, special needs, etc. Those will be collected via WhatsApp form AFTER payment.

BOOKING FLOW:
1. Collect the 6 required items naturally
2. If missing items, ask for them (one or two at a time)
3. Calculate price based on dates
4. Show confirmation summary with price
5. Wait for user to confirm (says "yes", "sí", "confirm", etc.)
6. After confirmation, user will be directed to pay

DATE/TIME HANDLING:
- Today is ${todayStr}
- If user says "tomorrow", it's the day after ${todayStr}
- Accept any time format (8am, 8:00, 20:00, etc.) and convert to 24-hour format
- Format times as "YYYY-MM-DD HH:mm" in startLocal/endLocal
- ALWAYS verify end time is after start time

CONVERSATION STYLE:
- Thank users for information they provide
- Be encouraging and positive
- If user makes a joke, respond naturally
- If user seems unsure, reassure them
- Use emojis sparingly (😊 🐕)

IMPORTANT RULES:
- NEVER create a booking (action: "create_booking") until user explicitly confirms
- NEVER ask about allergies, medical conditions, behavior, breed, or special needs
- NEVER repeat the same question twice
- If user is correcting dates/times, set fixDuplicate: true

JSON OUTPUT:
{
  "reply": "Your natural, conversational response",
  "action": "none" | "create_booking",
  "lead": {
    "language": "${lang}",
    "service": "Daycare",
    "dogName": "Max",
    "dogAge": "3 years",
    "ownerName": "John Smith",
    "ownerPhone": "+44 7700 900000",
    "startLocal": "2026-01-15 08:00",
    "endLocal": "2026-01-15 17:00"
  },
  "booking": null or {
    "service": "Daycare",
    "dogName": "Max",
    "dogAge": "3 years",
    "ownerName": "John Smith",
    "ownerPhone": "+44 7700 900000",
    "startLocal": "2026-01-15 08:00",
    "endLocal": "2026-01-15 17:00",
    "notes": "Drop-off: 08:00, Pick-up: 17:00",
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
        ? "Veo que la hora de recogida debe ser después de la entrega. ¿Puedes confirmarme los horarios de nuevo?"
        : "I see the pick-up time needs to be after drop-off. Can you confirm the times again?";
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

    const price = computePriceGBP(service, startISO, endISO);
    const priceLine = price.total > 0 ? `£${price.total} (${price.detail})` : "TBD";

    if (!userConfirmed && dogName && ownerName && ownerPhone) {
      console.log(`📋 [${traceId}] Sending confirmation request`);
      const reply = buildConfirmation(lang, {
        service,
        dogName,
        dogAge: mergedLead.dogAge || booking?.dogAge,
        ownerName,
        ownerPhone,
        startISO,
        endISO,
        priceLine,
      });

      mergedLead.service = service;
      mergedLead.dogName = dogName;
      mergedLead.ownerName = ownerName;
      mergedLead.ownerPhone = ownerPhone;

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
          startISO,
          endISO,
          totalPrice: priceLine,
          fixDuplicate: Boolean(booking?.fixDuplicate) || /cambiar|modificar|corrige|change|modify|correct/i.test(lastUserText),
        },
      });
    }

    if (userConfirmed && dogName && ownerName && ownerPhone) {
      console.log(`✅ [${traceId}] User confirmed, requesting payment`);
      const finalBooking = {
        ...booking,
        service,
        dogName,
        ownerName,
        ownerPhone,
        startISO,
        endISO,
        totalPrice: priceLine,
        notes: booking?.notes || `Drop-off: ${booking?.startLocal || startISO}, Pick-up: ${booking?.endLocal || endISO}`,
        fixDuplicate: Boolean(booking?.fixDuplicate) || /cambiar|modificar|corrige|change|modify|correct/i.test(lastUserText),
      };

      const finalReply = lang === "es"
        ? `¡Perfecto! Para confirmar tu reserva de ${priceLine}, necesito que completes el pago. Te voy a generar un link seguro.`
        : `Perfect! To confirm your booking of ${priceLine}, I need you to complete the payment. I'll generate a secure payment link for you.`;

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