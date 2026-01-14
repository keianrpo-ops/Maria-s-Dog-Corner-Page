import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

type AnyMsg = { role?: any; content?: any };
const VERSION = "geminiService@v4";

function sanitizeMessages(input: AnyMsg[]) {
  const out: { role: "user" | "assistant"; content: string }[] = [];

  for (const m of input || []) {
    if (!m) continue;
    const role = m.role;
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

  const body = (req as any).body || {};
  const rawMessages: AnyMsg[] = Array.isArray(body.messages) ? body.messages : [];
  const leadIn = body.lead || {};

  const messages = sanitizeMessages(rawMessages);

  if (!messages.length) {
    return res.status(400).json({
      ok: false,
      traceId,
      version: VERSION,
      error: "No valid messages after sanitize.",
    });
  }

  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentHour = today.getHours();

    const system = `You are Maria, the owner of Maria's Dog Corner in Bristol, UK.
Today is ${todayStr} and current time is ${currentHour}:00.

CRITICAL RULES FOR BOOKING CREATION:
1. ONLY set action to "create_booking" when you have ALL of these:
   - Dog Name
   - Owner Name  
   - Owner Phone
   - Service (must be one of: Daycare, Boarding, Pet Sitting, Dog Walk)
   - Date and time

2. BOOKING FORMAT (CRITICAL):
   When creating a booking, the "booking" object MUST include:
   {
     "startISO": "YYYY-MM-DDTHH:MM:00Z",  // REQUIRED: ISO 8601 format in UTC
     "endISO": "YYYY-MM-DDTHH:MM:00Z",    // REQUIRED: ISO 8601 format in UTC
     "service": "Daycare",                 // REQUIRED: exactly one of: Daycare, Boarding, Pet Sitting, Dog Walk
     "dogName": "Tobby",                   // REQUIRED
     "ownerName": "Juan Carlos",           // REQUIRED
     "ownerPhone": "+1234567890"           // REQUIRED
   }

3. TIME CONVERSION:
   - User will give time in their timezone (UK time: GMT+0)
   - Convert to UTC for startISO/endISO
   - Example: User says "9 AM tomorrow" -> "2026-01-${String(today.getDate() + 1).padStart(2, '0')}T09:00:00Z"

4. DEFAULT DURATIONS:
   - Daycare: 8 hours (9 AM to 5 PM)
   - Pet Sitting: 1 hour
   - Dog Walk: 1 hour
   - Boarding: calculate based on dates

5. LANGUAGE:
   - Match user's language (Spanish or English)
   - Be friendly and efficient

6. NEVER create booking without ALL required data

Return ONLY valid JSON:
{
  "reply": "your message to user",
  "action": "none" or "create_booking",
  "lead": { collected data },
  "booking": { startISO, endISO, service, dogName, ownerName, ownerPhone } or null
}`;

    const outgoing = [{ role: "system", content: system }, ...messages.slice(-10)];

    console.log(`[${VERSION}] Calling OpenAI with ${messages.length} messages`);

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
        temperature: 0.7,
      }),
    });

    const data = await r.json().catch(() => ({} as any));

    if (!r.ok) {
      const msg = data?.error?.message || `OpenAI HTTP ${r.status}`;
      console.error(`[${VERSION}] OpenAI error:`, msg);
      return res.status(500).json({ 
        ok: false, 
        traceId, 
        version: VERSION, 
        error: msg, 
        diagnostic: data?.error || data 
      });
    }

    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
      console.error(`[${VERSION}] Empty OpenAI response`);
      return res.status(500).json({ 
        ok: false, 
        traceId, 
        version: VERSION, 
        error: "OpenAI returned empty content" 
      });
    }

    let ai: any;
    try {
      ai = JSON.parse(content);
    } catch (err) {
      console.error(`[${VERSION}] JSON parse failed:`, content.slice(0, 200));
      return res.status(500).json({
        ok: false,
        traceId,
        version: VERSION,
        error: "AI returned invalid JSON (parse failed)",
        diagnostic: { rawPreview: content.slice(0, 400) },
      });
    }

    if (typeof ai?.reply !== "string" || !ai.reply.trim()) {
      console.error(`[${VERSION}] Missing reply in AI response:`, ai);
      return res.status(500).json({
        ok: false,
        traceId,
        version: VERSION,
        error: "AI JSON missing a valid 'reply' string",
        diagnostic: { keys: Object.keys(ai || {}) },
      });
    }

    // Validate booking if action is create_booking
    if (ai.action === "create_booking" && ai.booking) {
      const b = ai.booking;
      const missing = [];
      
      if (!b.startISO) missing.push("startISO");
      if (!b.service) missing.push("service");
      if (!b.dogName && !b.dogNames) missing.push("dogName");
      if (!b.ownerName) missing.push("ownerName");
      if (!b.ownerPhone && !b.contact) missing.push("ownerPhone");

      if (missing.length > 0) {
        console.warn(`[${VERSION}] Booking missing fields:`, missing);
        ai.action = "none";
        ai.booking = null;
        ai.reply += `\n\n(Necesito confirmar: ${missing.join(", ")})`;
      }
    }

    console.log(`[${VERSION}] Success:`, { action: ai.action, hasBooking: !!ai.booking });

    return res.status(200).json({
      ok: true,
      traceId,
      version: VERSION,
      reply: ai.reply,
      action: ai.action || "none",
      lead: { ...leadIn, ...(ai.lead || {}) },
      booking: ai.booking || null,
    });
  } catch (e: any) {
    console.error(`[${VERSION}] Fatal error:`, e);
    return res.status(500).json({
      ok: false,
      traceId,
      version: VERSION,
      error: e?.message || "Server error",
    });
  }
}